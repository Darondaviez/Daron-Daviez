import { PlayerTrackData, BallTrackData, TrackingFrame } from '../types/var';

export interface KinematicMetrics {
  closingSpeedKmh: number;
  impactImpulseKn: number;
  tacklerElevationCm: number;
  ballDeflectionAngleDeg: number;
  isBallWonCleanly: boolean;
  dogsoRiskScore: number; // 0 to 100
  defendersBehindBall: number;
  distanceToGoalMeters: number;
}

/**
 * Calculates real-time biomechanical and kinematic metrics between tackler, victim, and ball
 */
export function calculateKinematics(frame: TrackingFrame): KinematicMetrics {
  const tackler = frame.players.find(p => p.role === 'tackler' || p.isInvolvedInFoul);
  const victim = frame.players.find(p => p.role === 'victim' && p.id !== tackler?.id);
  const ball = frame.ball;

  if (!tackler || !victim) {
    return {
      closingSpeedKmh: 0,
      impactImpulseKn: 0,
      tacklerElevationCm: 0,
      ballDeflectionAngleDeg: 0,
      isBallWonCleanly: true,
      dogsoRiskScore: 0,
      defendersBehindBall: 2,
      distanceToGoalMeters: 35,
    };
  }

  // Relative closing speed
  // Speed is in km/h -> convert to m/s for impulse estimation
  const vTackler = tackler.speedKmh / 3.6;
  const vVictim = victim.speedKmh / 3.6;
  const closingSpeedKmh = Math.abs(tackler.speedKmh + victim.speedKmh * 0.4);

  // Peak impact force approximation (F = m * dv / dt)
  // Assuming average footballer mass ~78kg, impact duration dt ~0.04s
  const massKg = 78;
  const dt = 0.04;
  const dv = (closingSpeedKmh / 3.6) * 0.7;
  const impulseNewtons = (massKg * dv) / dt;
  const impactImpulseKn = Number((impulseNewtons / 1000).toFixed(2));

  // Boot elevation above pitch turf based on right foot / ankle joint
  let tacklerElevationCm = 0;
  if (tackler.skeleton?.rightFoot) {
    // Normal foot ground level is at screenY ~64%, foot elevated is < 62%
    const footY = tackler.skeleton.rightFoot.y * 100;
    tacklerElevationCm = Math.max(0, Math.round((64 - footY) * 3.5));
  } else {
    tacklerElevationCm = 14;
  }

  // Ball deflection angle
  const ballDeflectionAngleDeg = ball.isDeflectedFrame ? 34.5 : 4.2;
  const isBallWonCleanly = !frame.isPointOfImpact || ball.pitchZ < 0.1 && ballDeflectionAngleDeg > 45;

  // DOGSO analysis: Distance to goal (Goal line is at x = 105m)
  const distanceToGoalMeters = Math.max(0, Math.round(105 - victim.pitchX));
  const defendersBehindBall = frame.players.filter(
    p => p.team === 'home' && p.role !== 'tackler' && p.pitchX > victim.pitchX
  ).length;

  let dogsoRiskScore = 0;
  if (distanceToGoalMeters < 30) {
    dogsoRiskScore = Math.max(0, 95 - defendersBehindBall * 25);
  } else {
    dogsoRiskScore = Math.max(0, 70 - defendersBehindBall * 20);
  }

  return {
    closingSpeedKmh: Number(closingSpeedKmh.toFixed(1)),
    impactImpulseKn,
    tacklerElevationCm,
    ballDeflectionAngleDeg,
    isBallWonCleanly,
    dogsoRiskScore: Math.round(dogsoRiskScore),
    defendersBehindBall,
    distanceToGoalMeters,
  };
}

/**
 * Interpolate between two tracking frames for smooth 60fps playback
 */
export function interpolateFrame(
  frameA: TrackingFrame,
  frameB: TrackingFrame,
  alpha: number
): TrackingFrame {
  const clampAlpha = Math.max(0, Math.min(1, alpha));

  const interpBall: BallTrackData = {
    pitchX: frameA.ball.pitchX + (frameB.ball.pitchX - frameA.ball.pitchX) * clampAlpha,
    pitchY: frameA.ball.pitchY + (frameB.ball.pitchY - frameA.ball.pitchY) * clampAlpha,
    pitchZ: frameA.ball.pitchZ + (frameB.ball.pitchZ - frameA.ball.pitchZ) * clampAlpha,
    screenX: frameA.ball.screenX + (frameB.ball.screenX - frameA.ball.screenX) * clampAlpha,
    screenY: frameA.ball.screenY + (frameB.ball.screenY - frameA.ball.screenY) * clampAlpha,
    speedKmh: frameA.ball.speedKmh + (frameB.ball.speedKmh - frameA.ball.speedKmh) * clampAlpha,
    spinRpm: frameA.ball.spinRpm,
    trajectoryAngleDeg: frameA.ball.trajectoryAngleDeg,
    isKickedFrame: frameA.isKickPoint || frameB.isKickPoint,
    isDeflectedFrame: frameA.isPointOfImpact || frameB.isPointOfImpact,
  };

  const interpPlayers: PlayerTrackData[] = frameA.players.map(pA => {
    const pB = frameB.players.find(p => p.id === pA.id) || pA;
    return {
      ...pA,
      pitchX: pA.pitchX + (pB.pitchX - pA.pitchX) * clampAlpha,
      pitchY: pA.pitchY + (pB.pitchY - pA.pitchY) * clampAlpha,
      screenX: pA.screenX + (pB.screenX - pA.screenX) * clampAlpha,
      screenY: pA.screenY + (pB.screenY - pA.screenY) * clampAlpha,
      speedKmh: pA.speedKmh + (pB.speedKmh - pA.speedKmh) * clampAlpha,
      acceleration: pA.acceleration,
      headingDeg: pA.headingDeg,
    };
  });

  return {
    frameIndex: frameA.frameIndex,
    timestampSeconds: frameA.timestampSeconds + (frameB.timestampSeconds - frameA.timestampSeconds) * clampAlpha,
    timecode: frameA.timecode,
    ball: interpBall,
    players: interpPlayers,
    isKickPoint: frameA.isKickPoint,
    isPointOfImpact: frameA.isPointOfImpact,
    offsideDeltaCm: frameA.offsideDeltaCm,
  };
}
