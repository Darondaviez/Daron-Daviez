import { MatchIncident, TrackingFrame, PlayerTrackData, BallTrackData, PlayerSkeleton } from '../types/var';

const tackleWideImg = '/src/assets/images/incident_tackle_wide_1793769931164.jpg';
const contactCloseImg = '/src/assets/images/incident_contact_close_1793769931631.jpg';
const varRoomImg = '/src/assets/images/var_room_operator_1793769930143.jpg';
const pitchsideImg = '/src/assets/images/pitchside_monitor_review_1793769932039.jpg';

// Helper to generate realistic frame-by-frame 22-player and ball tracking telemetry
function generateTackleFrames(): TrackingFrame[] {
  const frames: TrackingFrame[] = [];
  const totalFrames = 120; // ~2.4 seconds at 50fps
  const impactFrame = 65;
  const kickPointFrame = 40;

  for (let f = 0; f < totalFrames; f++) {
    const t = f / 50; // seconds
    const progress = f / totalFrames;

    // Tackler dynamics (Blue #6 - Wilson)
    // Runs towards striker, slides, studs up at frame 65
    const tacklerSpeed = f < 50 ? 28.4 - (50 - f) * 0.1 : f < 65 ? 24.2 - (f - 50) * 0.4 : Math.max(3.0, 18.2 - (f - 65) * 0.5);
    const tacklerScreenX = 42 + progress * 14;
    const tacklerScreenY = 58 + Math.sin(progress * Math.PI) * 4;

    // Striker dynamics (Red #9 - Davies)
    // Dribbling ball, receives contact at frame 65, leg rotates
    const strikerSpeed = f < 65 ? 22.1 + (f * 0.05) : Math.max(1.5, 14.0 - (f - 65) * 0.35);
    const strikerScreenX = 49 + progress * 8;
    const strikerScreenY = 56 - (f >= 65 ? Math.sin((f - 65) / 20) * 8 : 0);

    // Ball dynamics
    // Moving ahead of striker until frame 65 where it continues untouched or slightly deflected
    const ballScreenX = f < 65 ? 51 + (f / 65) * 6 : 57 + (f - 65) * 0.35;
    const ballScreenY = f < 65 ? 60 - Math.sin((f / 65) * Math.PI) * 2 : 60 + (f - 65) * 0.1;
    const ballPitchZ = f < 65 ? 0.05 : 0.2 + Math.sin((f - 65) / 25) * 0.6;
    const ballSpeed = f < 65 ? 19.5 : 23.8;

    // Tackler 17-joint skeleton
    const tacklerSkeleton: PlayerSkeleton = {
      head: { x: (tacklerScreenX - 6) / 100, y: (tacklerScreenY - 14) / 100, confidence: 0.98 },
      neck: { x: (tacklerScreenX - 5) / 100, y: (tacklerScreenY - 11) / 100, confidence: 0.97 },
      leftShoulder: { x: (tacklerScreenX - 7) / 100, y: (tacklerScreenY - 9) / 100, confidence: 0.96 },
      rightShoulder: { x: (tacklerScreenX - 3) / 100, y: (tacklerScreenY - 9) / 100, confidence: 0.96 },
      leftElbow: { x: (tacklerScreenX - 9) / 100, y: (tacklerScreenY - 4) / 100, confidence: 0.94 },
      rightElbow: { x: (tacklerScreenX - 1) / 100, y: (tacklerScreenY - 4) / 100, confidence: 0.95 },
      leftWrist: { x: (tacklerScreenX - 10) / 100, y: (tacklerScreenY) / 100, confidence: 0.92 },
      rightWrist: { x: (tacklerScreenX) / 100, y: (tacklerScreenY) / 100, confidence: 0.93 },
      pelvis: { x: (tacklerScreenX - 4) / 100, y: (tacklerScreenY - 1) / 100, confidence: 0.98 },
      leftHip: { x: (tacklerScreenX - 6) / 100, y: (tacklerScreenY) / 100, confidence: 0.97 },
      rightHip: { x: (tacklerScreenX - 2) / 100, y: (tacklerScreenY) / 100, confidence: 0.97 },
      leftKnee: { x: (tacklerScreenX - 4) / 100, y: (tacklerScreenY + 4) / 100, confidence: 0.95 },
      // Right leg: extended sliding forward with studs up
      rightKnee: { x: (tacklerScreenX + 2) / 100, y: (tacklerScreenY + 2) / 100, confidence: 0.96 },
      leftAnkle: { x: (tacklerScreenX - 6) / 100, y: (tacklerScreenY + 8) / 100, confidence: 0.94 },
      rightAnkle: { x: (tacklerScreenX + 6) / 100, y: (tacklerScreenY + 3) / 100, confidence: 0.97 },
      leftFoot: { x: (tacklerScreenX - 7) / 100, y: (tacklerScreenY + 9) / 100, confidence: 0.93 },
      // Point of studs impact
      rightFoot: {
        x: (f >= 60 && f <= 75 ? strikerScreenX - 1 : tacklerScreenX + 8) / 100,
        y: (f >= 60 && f <= 75 ? strikerScreenY + 3 : tacklerScreenY + 4) / 100,
        confidence: 0.99,
      },
    };

    // Striker 17-joint skeleton
    const strikerSkeleton: PlayerSkeleton = {
      head: { x: (strikerScreenX) / 100, y: (strikerScreenY - 18) / 100, confidence: 0.99 },
      neck: { x: (strikerScreenX) / 100, y: (strikerScreenY - 14) / 100, confidence: 0.98 },
      leftShoulder: { x: (strikerScreenX - 3) / 100, y: (strikerScreenY - 12) / 100, confidence: 0.97 },
      rightShoulder: { x: (strikerScreenX + 3) / 100, y: (strikerScreenY - 12) / 100, confidence: 0.97 },
      leftElbow: { x: (strikerScreenX - 5) / 100, y: (strikerScreenY - 7) / 100, confidence: 0.95 },
      rightElbow: { x: (strikerScreenX + 5) / 100, y: (strikerScreenY - 7) / 100, confidence: 0.95 },
      leftWrist: { x: (strikerScreenX - 6) / 100, y: (strikerScreenY - 2) / 100, confidence: 0.94 },
      rightWrist: { x: (strikerScreenX + 6) / 100, y: (strikerScreenY - 2) / 100, confidence: 0.94 },
      pelvis: { x: (strikerScreenX) / 100, y: (strikerScreenY - 5) / 100, confidence: 0.98 },
      leftHip: { x: (strikerScreenX - 2) / 100, y: (strikerScreenY - 4) / 100, confidence: 0.97 },
      rightHip: { x: (strikerScreenX + 2) / 100, y: (strikerScreenY - 4) / 100, confidence: 0.97 },
      leftKnee: { x: (strikerScreenX - 3) / 100, y: (strikerScreenY + 1) / 100, confidence: 0.96 },
      rightKnee: { x: (strikerScreenX + 2) / 100, y: (strikerScreenY + 2) / 100, confidence: 0.96 },
      // Left leg bearing weight and receiving impact on shin
      leftAnkle: { x: (strikerScreenX - 1) / 100, y: (strikerScreenY + 6) / 100, confidence: 0.98 },
      rightAnkle: { x: (strikerScreenX + 3) / 100, y: (strikerScreenY + 7) / 100, confidence: 0.95 },
      leftFoot: { x: (strikerScreenX - 1) / 100, y: (strikerScreenY + 8) / 100, confidence: 0.97 },
      rightFoot: { x: (strikerScreenX + 4) / 100, y: (strikerScreenY + 8) / 100, confidence: 0.96 },
    };

    const players: PlayerTrackData[] = [
      {
        id: 'p_blue_6',
        name: 'M. Wilson',
        number: 6,
        team: 'home',
        role: 'tackler',
        pitchX: 62.4 + progress * 6.2,
        pitchY: 34.2 + progress * 1.5,
        screenX: tacklerScreenX,
        screenY: tacklerScreenY,
        speedKmh: tacklerSpeed,
        acceleration: -3.8,
        headingDeg: 42,
        skeleton: tacklerSkeleton,
        isInvolvedInFoul: true,
      },
      {
        id: 'p_red_9',
        name: 'D. Sterling',
        number: 9,
        team: 'away',
        role: 'victim',
        pitchX: 68.2 + progress * 4.1,
        pitchY: 35.8 - (f >= 65 ? (f - 65) * 0.08 : 0),
        screenX: strikerScreenX,
        screenY: strikerScreenY,
        speedKmh: strikerSpeed,
        acceleration: f >= 65 ? -7.2 : 1.4,
        headingDeg: 85,
        skeleton: strikerSkeleton,
        isInvolvedInFoul: true,
      },
      // Center Referee
      {
        id: 'ref_1',
        name: 'M. Oliver',
        number: 0,
        team: 'referee',
        role: 'outfield',
        pitchX: 52.0 + progress * 2.0,
        pitchY: 26.5 + progress * 0.8,
        screenX: 28.5 + progress * 1.5,
        screenY: 42.0 + progress * 0.5,
        speedKmh: 14.2,
        acceleration: 0.2,
        headingDeg: 35,
        isInvolvedInFoul: false,
      },
      // Supporting defenders & attackers
      {
        id: 'p_blue_4',
        name: 'V. Stones',
        number: 4,
        team: 'home',
        role: 'last_defender',
        pitchX: 74.0 - progress * 1.0,
        pitchY: 30.5,
        screenX: 72.0,
        screenY: 48.0,
        speedKmh: 18.5,
        acceleration: -0.4,
        headingDeg: 270,
        isInvolvedInFoul: false,
      },
      {
        id: 'p_blue_1',
        name: 'E. Ederson',
        number: 1,
        team: 'home',
        role: 'goalkeeper',
        pitchX: 98.5,
        pitchY: 34.0,
        screenX: 92.0,
        screenY: 45.0,
        speedKmh: 4.2,
        acceleration: 0.0,
        headingDeg: 270,
        isInvolvedInFoul: false,
      },
      {
        id: 'p_red_7',
        name: 'B. Saka',
        number: 7,
        team: 'away',
        role: 'receiver',
        pitchX: 71.0 + progress * 3.0,
        pitchY: 52.0,
        screenX: 68.0,
        screenY: 74.0,
        speedKmh: 24.8,
        acceleration: 1.2,
        headingDeg: 90,
        isInvolvedInFoul: false,
      },
    ];

    const ball: BallTrackData = {
      pitchX: 68.8 + (f / 65) * 5.2,
      pitchY: 35.6,
      pitchZ: ballPitchZ,
      screenX: ballScreenX,
      screenY: ballScreenY,
      speedKmh: ballSpeed,
      spinRpm: 420,
      trajectoryAngleDeg: 12,
      isKickedFrame: f === kickPointFrame,
      isDeflectedFrame: f === impactFrame,
    };

    const s = Math.floor(t);
    const ms = Math.floor((t % 1) * 100);
    const timecode = `00:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;

    frames.push({
      frameIndex: f,
      timestampSeconds: t,
      timecode,
      ball,
      players,
      isKickPoint: f === kickPointFrame,
      isPointOfImpact: f === impactFrame,
    });
  }

  return frames;
}

// Generate penalty box simulation vs trip frames
function generatePenaltyFrames(): TrackingFrame[] {
  const frames: TrackingFrame[] = [];
  const totalFrames = 120;
  const impactFrame = 58;

  for (let f = 0; f < totalFrames; f++) {
    const t = f / 50;
    const progress = f / totalFrames;
    const isImpact = f === impactFrame;

    const defenderScreenX = 52 + progress * 5;
    const defenderScreenY = 62 + progress * 2;
    const attackerScreenX = 54 + progress * 6;
    const attackerScreenY = 60 - (f > impactFrame ? Math.sin((f - impactFrame) / 15) * 6 : 0);

    const players: PlayerTrackData[] = [
      {
        id: 'p_white_5',
        name: 'R. Varane',
        number: 5,
        team: 'home',
        role: 'tackler',
        pitchX: 89.2 + progress * 2.0,
        pitchY: 33.5,
        screenX: defenderScreenX,
        screenY: defenderScreenY,
        speedKmh: 16.2,
        acceleration: -2.1,
        headingDeg: 120,
        isInvolvedInFoul: true,
      },
      {
        id: 'p_red_11',
        name: 'M. Salah',
        number: 11,
        team: 'away',
        role: 'victim',
        pitchX: 91.0 + progress * 2.5,
        pitchY: 34.2,
        screenX: attackerScreenX,
        screenY: attackerScreenY,
        speedKmh: 21.4,
        acceleration: f > impactFrame ? -6.0 : 0.8,
        headingDeg: 95,
        isInvolvedInFoul: true,
      },
    ];

    const ball: BallTrackData = {
      pitchX: 93.0 + progress * 3.5,
      pitchY: 34.0,
      pitchZ: 0.08,
      screenX: 58 + progress * 7,
      screenY: 59,
      speedKmh: 18.2,
      spinRpm: 310,
      trajectoryAngleDeg: 8,
    };

    const s = Math.floor(t);
    const ms = Math.floor((t % 1) * 100);

    frames.push({
      frameIndex: f,
      timestampSeconds: t,
      timecode: `00:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`,
      ball,
      players,
      isKickPoint: f === 30,
      isPointOfImpact: isImpact,
    });
  }

  return frames;
}

// Generate offside tracking frames with 3D projection
function generateOffsideFrames(): TrackingFrame[] {
  const frames: TrackingFrame[] = [];
  const totalFrames = 120;
  const kickPointFrame = 48;

  for (let f = 0; f < totalFrames; f++) {
    const t = f / 50;
    const progress = f / totalFrames;

    const defenderX = 76.5 + progress * 1.2;
    const attackerX = 76.72 + progress * 2.1; // 22cm ahead of defender line

    const players: PlayerTrackData[] = [
      {
        id: 'p_blue_3',
        name: 'R. Dias',
        number: 3,
        team: 'home',
        role: 'last_defender',
        pitchX: defenderX,
        pitchY: 28.4,
        screenX: 62.0 + progress * 2,
        screenY: 44.0,
        speedKmh: 19.8,
        acceleration: 0.1,
        headingDeg: 90,
        isInvolvedInFoul: true,
      },
      {
        id: 'p_red_10',
        name: 'K. Mbappe',
        number: 10,
        team: 'away',
        role: 'receiver',
        pitchX: attackerX,
        pitchY: 31.0,
        screenX: 63.8 + progress * 3,
        screenY: 48.0,
        speedKmh: 31.2,
        acceleration: 2.4,
        headingDeg: 90,
        isInvolvedInFoul: true,
      },
    ];

    const ball: BallTrackData = {
      pitchX: 48.0 + (f / kickPointFrame) * 18.0,
      pitchY: 30.0,
      pitchZ: f > kickPointFrame ? 1.4 : 0.05,
      screenX: 35.0 + (f / kickPointFrame) * 25.0,
      screenY: 52.0 - (f > kickPointFrame ? Math.sin((f - kickPointFrame) / 20) * 12 : 0),
      speedKmh: 64.0,
      spinRpm: 600,
      trajectoryAngleDeg: 18,
      isKickedFrame: f === kickPointFrame,
    };

    const s = Math.floor(t);
    const ms = Math.floor((t % 1) * 100);

    frames.push({
      frameIndex: f,
      timestampSeconds: t,
      timecode: `00:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`,
      ball,
      players,
      isKickPoint: f === kickPointFrame,
      offsideDeltaCm: 22.4, // +22.4cm offside
    });
  }

  return frames;
}

export const MATCH_INCIDENTS: MatchIncident[] = [
  {
    id: 'inc-01-tackle-sfp',
    title: 'High-Studs Shin Tackle (Potential Red Card)',
    matchFixture: 'MANCHESTER DERBY // ETIHAD STADIUM',
    matchMinute: "73' 14\"",
    incidentType: 'tackle',
    initialOnFieldCall: 'Play On (Advantage) - Later stopped for injury',
    description: 'Sliding challenge at high velocity. Defender makes contact with opponent mid-shin above the ankle with studs showing.',
    totalDurationSeconds: 2.4,
    totalFrames: 120,
    fps: 50,
    kickPointFrame: 40,
    impactFrame: 65,
    cameraFeeds: {
      broadcast_wide: {
        name: 'Cam 1 · Broadcast Tactical Wide',
        poster: tackleWideImg,
        description: 'Main wide angle showing approach speed, pitch position, and referee sightline.',
      },
      telephoto_contact: {
        name: 'Cam 2 · Telephoto Slow-Mo Contact',
        poster: contactCloseImg,
        description: 'Ultra close-up telephoto 500fps camera isolating the point of studs impact on the shin.',
      },
      reverse_pitchside: {
        name: 'Cam 3 · Reverse Pitchside Bench',
        poster: pitchsideImg,
        description: 'Reverse low angle illustrating straight leg locking and point of force transfer.',
      },
      high_endzone: {
        name: 'Cam 4 · VAR Ops Master Multiview',
        poster: varRoomImg,
        description: 'Control room angle with Hawk-Eye optical tracking line overlay.',
      },
    },
    trackingFrames: generateTackleFrames(),
    defaultAiVerdict: {
      recommendedDecision: 'RED_CARD_SERIOUS_FOUL_PLAY',
      decisionLabel: 'Recommend OFR: Direct Red Card (Serious Foul Play)',
      varAction: 'OFR_RECOMMENDED',
      lawCitation: 'IFAB Law 12.3: Serious Foul Play - Tackling or challenging an opponent endangering safety or using excessive force',
      confidenceScore: 97.4,
      severityLevel: 'Critical',
      biomechanicalMetrics: {
        studsExposed: true,
        contactHeight: 'Mid-shin (14.2 cm above ankle collar)',
        legExtension: 'Straight leg with locked knee',
        ballTouchPrior: false,
        forceVelocityEstimate: '26.8 km/h closing momentum, ~3.4 kN peak impulse',
        endangersSafety: true,
      },
      contactPointDescription: 'Defender right boot studs made primary initial contact against opponent left tibia/shin guard. No prior touch on the ball.',
      freezeFrameTimestamp: '01:18.00 (Frame 65)',
      refereeIntercomAudioScript: 'Michael, this is VAR David. We recommend an on-field review for a potential red card. The challenge by Blue #6 shows studs making direct contact on the shin above the boot collar with excessive force. I will show you the contact point first at 0.5x speed.',
      officialRationale: 'Clear and obvious error. The challenge fulfills all criteria for Serious Foul Play under IFAB Law 12.3: excessive force, high point of contact with studs showing, straight leg, and total disregard for opponent player safety.',
    },
  },
  {
    id: 'inc-02-penalty-box-trip',
    title: 'Penalty Box Slide & Trailing Leg Contact',
    matchFixture: 'ARSENAL vs LIVERPOOL // EMIRATES STADIUM',
    matchMinute: "88' 42\"",
    incidentType: 'penalty',
    initialOnFieldCall: 'No Penalty (Referee signaled simulation)',
    description: 'Striker cuts inside the penalty area. Defender commits to slide tackle. Striker goes down over defender outstretched leg.',
    totalDurationSeconds: 2.4,
    totalFrames: 120,
    fps: 50,
    kickPointFrame: 30,
    impactFrame: 58,
    cameraFeeds: {
      broadcast_wide: {
        name: 'Cam 1 · 18-Yard Box High Angle',
        poster: tackleWideImg,
        description: 'Full perspective of the penalty area cut-back and defender slide trajectory.',
      },
      telephoto_contact: {
        name: 'Cam 2 · Goal-Line Close Tracking',
        poster: contactCloseImg,
        description: 'Slow-motion inspection of trailing knee and boot clipping contact.',
      },
      reverse_pitchside: {
        name: 'Cam 3 · Pitchside Review Angle',
        poster: pitchsideImg,
        description: 'Sideline review showing defender missed the ball entirely.',
      },
      high_endzone: {
        name: 'Cam 4 · High Behind Goal Endzone',
        poster: varRoomImg,
        description: 'Demonstrating ball deviation caused by striker touch, not defender.',
      },
    },
    trackingFrames: generatePenaltyFrames(),
    defaultAiVerdict: {
      recommendedDecision: 'PENALTY_AWARDED',
      decisionLabel: 'Recommend OFR: Penalty Kick Awarded (Careless Trip)',
      varAction: 'OFR_RECOMMENDED',
      lawCitation: 'IFAB Law 12.1: Direct Free Kick / Penalty - Tripping or attempting to trip an opponent carelessly inside penalty area',
      confidenceScore: 94.8,
      severityLevel: 'Moderate',
      biomechanicalMetrics: {
        studsExposed: false,
        contactHeight: 'Lower foot / trailing instep (2.1 cm)',
        legExtension: 'Bent leg hurdle barrier',
        ballTouchPrior: false,
        forceVelocityEstimate: '16.2 km/h sliding barrier trip',
        endangersSafety: false,
      },
      contactPointDescription: 'Defender outstretched trailing leg creates an illegal obstruction trip on striker left instep after striker knocked the ball away.',
      freezeFrameTimestamp: '01:06.00 (Frame 58)',
      refereeIntercomAudioScript: 'Anthony, VAR here. We recommend an on-field review for a penalty kick. Blue #5 does not touch the ball; his trailing leg clearly trips Red #11 on the turn inside the penalty box.',
      officialRationale: 'Contact confirmed inside the 18-yard penalty box. Striker touched the ball away first; defender failed to touch the ball and impeded progress carelessly.',
    },
  },
  {
    id: 'inc-03-semi-automated-offside',
    title: 'Marginal Offside on Goal Leading Sequence',
    matchFixture: 'REAL MADRID vs BAYERN // SANTIAGO BERNABÉU',
    matchMinute: "64' 08\"",
    incidentType: 'offside',
    initialOnFieldCall: 'Goal Awarded (Assistant Referee flagged onside)',
    description: 'Through ball played over the top. Striker breaks through and scores. Check 3D virtual offside line at exact kick point.',
    totalDurationSeconds: 2.4,
    totalFrames: 120,
    fps: 50,
    kickPointFrame: 48,
    impactFrame: 48,
    cameraFeeds: {
      broadcast_wide: {
        name: 'Cam 1 · 16m Offside Tactical Cam',
        poster: tackleWideImg,
        description: 'Synchronized broadcast angle for kick point identification.',
      },
      telephoto_contact: {
        name: 'Cam 2 · 3D Semi-Automated SAOT Mesh',
        poster: contactCloseImg,
        description: 'Computer vision 29-joint skeleton projection with calibrated pitch vanishing grid.',
      },
      reverse_pitchside: {
        name: 'Cam 3 · Reverse Touchline Offside Cam',
        poster: pitchsideImg,
        description: 'Direct sideline cross-section confirming defender boot heel position.',
      },
      high_endzone: {
        name: 'Cam 4 · Hawk-Eye Laser Plane View',
        poster: varRoomImg,
        description: 'Hawk-Eye 3D plane projection illustrating 22.4 cm offside margin.',
      },
    },
    trackingFrames: generateOffsideFrames(),
    defaultAiVerdict: {
      recommendedDecision: 'OFFSIDE_OVERTURN',
      decisionLabel: 'Factual VAR Overturn: Offside Infraction (Goal Disallowed)',
      varAction: 'CHECK_COMPLETE',
      lawCitation: 'IFAB Law 11.2: Offside Offence - Being in an offside position at the moment the ball is played or touched by a teammate',
      confidenceScore: 99.2,
      severityLevel: 'None',
      biomechanicalMetrics: {
        studsExposed: false,
        contactHeight: 'N/A (Spatial Positioning)',
        legExtension: 'Torso / Knee forward lean',
        ballTouchPrior: true,
        forceVelocityEstimate: '31.2 km/h sprint velocity',
        endangersSafety: false,
      },
      contactPointDescription: 'Attacker shoulder and knee projection exceeds the second-last defender trailing heel plane by +22.4 cm at kick point release.',
      freezeFrameTimestamp: '00:48.00 (Kick-Point Frame)',
      refereeIntercomAudioScript: 'Szymon, VAR checking the goal. Kick-point confirmed at frame 48. Semi-automated offside lines show the attacker is in an offside position by 22 centimeters. Decision is offside, disallow the goal and restart with indirect free kick.',
      officialRationale: 'Factual geometric offside determination under Law 11. Attacker active scoring body part ahead of the calibrated second-last defender line.',
    },
  },
];
