import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Server-side Gemini AI Client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// VAR AI Foul Play Analysis Endpoint
app.post('/api/var/analyze', async (req, res) => {
  try {
    const {
      incidentTitle,
      incidentType,
      matchMinute,
      cameraAngle,
      snapshotBase64,
      timecode,
      manualNotes,
      defenderTeam,
      attackerTeam,
    } = req.body;

    const systemInstruction = `You are the lead Video Assistant Referee (VAR) AI Chief Analyst working according to official IFAB (International Football Association Board) Laws of the Game, specifically Law 12 (Fouls and Misconduct), Law 11 (Offside), and the VAR Protocol.
Analyze the provided match incident frame, tactical context, and biomechanical indicators.
Assess whether the challenge meets the threshold of:
- Serious Foul Play (Law 12.3: tackling/challenging endangering safety, excessive force, high studs above the ankle collar, straight-leg lunge)
- Reckless Challenge (Law 12.1: caution / Yellow Card, disregarding danger)
- Careless Challenge (Law 12.1: free kick only, lacking attention or consideration)
- Violent Conduct (Law 12.3: brutality without ball contest)
- Denial of an Obvious Goal-Scoring Opportunity (DOGSO)
- Penalty Box Incident: Illegal trip, push, holding, or simulation
- Offside Infraction (Law 11: second-last defender line vs active attacker scoring body parts).

Be decisive, authoritative, and strictly ground your decision on IFAB criteria. Return structured JSON.`;

    const promptText = `ANALYZE INCIDENT:
Incident: "${incidentTitle || 'Pitchside Foul Challenge'}"
Type: ${incidentType || 'tackle'}
Match Time: ${matchMinute || "73'"} (Timecode: ${timecode || '00:00.00'})
Camera Angle: ${cameraAngle || 'telephoto_contact'}
Teams: Defender: ${defenderTeam || 'Defending Team'}, Attacker: ${attackerTeam || 'Attacking Team'}
Context Notes: ${manualNotes || 'Contested high speed challenge, referee did not initially blow whistle or gave caution.'}

Examine the biomechanics:
1. Contact point: Is contact on the boot, ankle, Achilles, or upper tibia/shin?
2. Were the studs exposed and leading?
3. Was the tackling leg locked/straight?
4. Did the player play or touch the ball before making contact?
5. Was there excessive force endangering player safety?
6. Recommend clear VAR advice: Recommend On-Field Review (OFR) or Check Complete (confirm on-field call).`;

    const contents: any[] = [];
    const parts: any[] = [];

    // If an image snapshot was sent from the client canvas/video
    if (snapshotBase64 && typeof snapshotBase64 === 'string') {
      const cleanBase64 = snapshotBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    parts.push({ text: promptText });
    contents.push({ parts });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedDecision: {
              type: Type.STRING,
              description: 'One of: RED_CARD_SERIOUS_FOUL_PLAY, RED_CARD_VIOLENT_CONDUCT, YELLOW_CARD_RECKLESS, CARELESS_FREE_KICK, NO_FOUL_PLAY_ON, PENALTY_AWARDED, OFFSIDE_OVERTURN',
            },
            decisionLabel: {
              type: Type.STRING,
              description: 'Human-readable official broadcast decision, e.g., "Recommend OFR: Direct Red Card (Serious Foul Play)"',
            },
            varAction: {
              type: Type.STRING,
              description: 'OFR_RECOMMENDED or CHECK_COMPLETE',
            },
            lawCitation: {
              type: Type.STRING,
              description: 'Exact IFAB Law clause, e.g. "IFAB Law 12.3 - Serious Foul Play"',
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'Confidence percentage between 80 and 99',
            },
            severityLevel: {
              type: Type.STRING,
              description: 'One of: Critical, Severe, Moderate, Low, None',
            },
            biomechanicalMetrics: {
              type: Type.OBJECT,
              properties: {
                studsExposed: { type: Type.BOOLEAN },
                contactHeight: { type: Type.STRING, description: 'e.g., "Above ankle collar / Mid-shin"' },
                legExtension: { type: Type.STRING, description: 'e.g., "Locked knee, straight leg"' },
                ballTouchPrior: { type: Type.BOOLEAN, description: 'Whether ball was touched first' },
                forceVelocityEstimate: { type: Type.STRING, description: 'e.g., "24.6 km/h high-momentum follow-through"' },
                endangersSafety: { type: Type.BOOLEAN },
              },
              required: ['studsExposed', 'contactHeight', 'legExtension', 'ballTouchPrior', 'forceVelocityEstimate', 'endangersSafety'],
            },
            contactPointDescription: {
              type: Type.STRING,
              description: 'Precise anatomical description of contact point and impact vector',
            },
            freezeFrameTimestamp: {
              type: Type.STRING,
              description: 'Optimal millisecond timestamp for referee freeze frame',
            },
            refereeIntercomAudioScript: {
              type: Type.STRING,
              description: 'Simulated official VAR-to-Referee radio communication script',
            },
            officialRationale: {
              type: Type.STRING,
              description: 'Professional legal rationale suitable for the post-match incident report',
            },
          },
          required: [
            'recommendedDecision',
            'decisionLabel',
            'varAction',
            'lawCitation',
            'confidenceScore',
            'severityLevel',
            'biomechanicalMetrics',
            'contactPointDescription',
            'freezeFrameTimestamp',
            'refereeIntercomAudioScript',
            'officialRationale',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('VAR AI Analysis Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to complete VAR AI incident analysis',
    });
  }
});

// Offside calibration analysis endpoint
app.post('/api/var/calibrate-offside', async (req, res) => {
  try {
    const { kickPointTimecode, attackerPosition, defenderPosition, cameraPerspective } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Perform high-precision virtual offside geometry calculation under IFAB Law 11 for kick point at ${kickPointTimecode || '01:14.28'}.
Attacker lead scoring extremity: ${attackerPosition || 'Shoulder / Knee forward'}.
Second-last defender trailing extremity: ${defenderPosition || 'Trailing heel / Boot edge'}.
Camera perspective: ${cameraPerspective || 'High End-Zone 3D Oblique'}.
Provide delta in centimeters, offside verdict (OFFSIDE vs ONSIDE), and margin of error tolerance.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: 'OFFSIDE or ONSIDE' },
            deltaCm: { type: Type.NUMBER, description: 'Difference in cm, positive if offside, negative if onside' },
            withinToleranceMargin: { type: Type.BOOLEAN },
            kickPointValidated: { type: Type.BOOLEAN },
            radioStatement: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ['verdict', 'deltaCm', 'withinToleranceMargin', 'kickPointValidated', 'radioStatement', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Offside calibration error:', error);
    return res.status(500).json({ success: false, error: error?.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'VAR Apex Intelligence Engine' });
});

import http from 'http';

// Setup Vite middleware or static serving
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[VAR Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
