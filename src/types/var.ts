export type IncidentType =
  | 'tackle'
  | 'penalty'
  | 'offside'
  | 'handball'
  | 'dogso'
  | 'violent_conduct';

export type VARDecision =
  | 'RED_CARD_SERIOUS_FOUL_PLAY'
  | 'RED_CARD_VIOLENT_CONDUCT'
  | 'YELLOW_CARD_RECKLESS'
  | 'CARELESS_FREE_KICK'
  | 'NO_FOUL_PLAY_ON'
  | 'PENALTY_AWARDED'
  | 'OFFSIDE_OVERTURN';

export type CameraAngle =
  | 'broadcast_wide'
  | 'telephoto_contact'
  | 'reverse_pitchside'
  | 'high_endzone';

export interface JointPoint {
  x: number; // 0 to 1 relative to video frame
  y: number; // 0 to 1 relative to video frame
  confidence: number;
}

export interface PlayerSkeleton {
  head: JointPoint;
  neck: JointPoint;
  leftShoulder: JointPoint;
  rightShoulder: JointPoint;
  leftElbow: JointPoint;
  rightElbow: JointPoint;
  leftWrist: JointPoint;
  rightWrist: JointPoint;
  pelvis: JointPoint;
  leftHip: JointPoint;
  rightHip: JointPoint;
  leftKnee: JointPoint;
  rightKnee: JointPoint;
  leftAnkle: JointPoint;
  rightAnkle: JointPoint;
  leftFoot: JointPoint;
  rightFoot: JointPoint;
}

export interface PlayerTrackData {
  id: string;
  name: string;
  number: number;
  team: 'home' | 'away' | 'referee';
  role: 'tackler' | 'victim' | 'passer' | 'receiver' | 'last_defender' | 'goalkeeper' | 'outfield';
  pitchX: number; // 0 to 105 meters
  pitchY: number; // 0 to 68 meters
  screenX: number; // 0 to 100% of video
  screenY: number; // 0 to 100% of video
  speedKmh: number;
  acceleration: number; // m/s^2
  headingDeg: number;
  skeleton?: PlayerSkeleton;
  isInvolvedInFoul?: boolean;
}

export interface BallTrackData {
  pitchX: number;
  pitchY: number;
  pitchZ: number; // Height off ground in meters
  screenX: number;
  screenY: number;
  speedKmh: number;
  spinRpm: number;
  trajectoryAngleDeg: number;
  isKickedFrame?: boolean;
  isDeflectedFrame?: boolean;
}

export interface TrackingFrame {
  frameIndex: number;
  timestampSeconds: number;
  timecode: string;
  ball: BallTrackData;
  players: PlayerTrackData[];
  isKickPoint?: boolean;
  isPointOfImpact?: boolean;
  offsideDeltaCm?: number;
}

export interface MatchIncident {
  id: string;
  title: string;
  matchFixture: string;
  matchMinute: string;
  incidentType: IncidentType;
  initialOnFieldCall: string;
  description: string;
  totalDurationSeconds: number;
  totalFrames: number;
  fps: number;
  kickPointFrame: number;
  impactFrame: number;
  cameraFeeds: {
    broadcast_wide: { name: string; poster: string; description: string };
    telephoto_contact: { name: string; poster: string; description: string };
    reverse_pitchside: { name: string; poster: string; description: string };
    high_endzone: { name: string; poster: string; description: string };
  };
  trackingFrames: TrackingFrame[];
  defaultAiVerdict: {
    recommendedDecision: VARDecision;
    decisionLabel: string;
    varAction: 'OFR_RECOMMENDED' | 'CHECK_COMPLETE';
    lawCitation: string;
    confidenceScore: number;
    severityLevel: 'Critical' | 'Severe' | 'Moderate' | 'Low' | 'None';
    biomechanicalMetrics: {
      studsExposed: boolean;
      contactHeight: string;
      legExtension: string;
      ballTouchPrior: boolean;
      forceVelocityEstimate: string;
      endangersSafety: boolean;
    };
    contactPointDescription: string;
    freezeFrameTimestamp: string;
    refereeIntercomAudioScript: string;
    officialRationale: string;
  };
}

export interface TelestratorAnnotation {
  id: string;
  type: 'line' | 'arrow' | 'circle' | 'freehand' | 'offside_line' | 'contact_loupe' | 'distance_marker';
  color: string;
  points: { x: number; y: number }[];
  text?: string;
  frameIndex?: number;
}

export interface AIAnalysisResult {
  recommendedDecision: VARDecision;
  decisionLabel: string;
  varAction: 'OFR_RECOMMENDED' | 'CHECK_COMPLETE';
  lawCitation: string;
  confidenceScore: number;
  severityLevel: 'Critical' | 'Severe' | 'Moderate' | 'Low' | 'None';
  biomechanicalMetrics: {
    studsExposed: boolean;
    contactHeight: string;
    legExtension: string;
    ballTouchPrior: boolean;
    forceVelocityEstimate: string;
    endangersSafety: boolean;
  };
  contactPointDescription: string;
  freezeFrameTimestamp: string;
  refereeIntercomAudioScript: string;
  officialRationale: string;
}
