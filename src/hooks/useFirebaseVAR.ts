import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { MatchIncident } from '../types/var';

export interface SavedReviewRecord {
  id: string;
  incidentId: string;
  userId: string;
  userEmail: string;
  recommendedDecision: string;
  refereeAction: 'CONFIRMED' | 'OVERTURNED' | 'PENDING';
  confidenceScore: number;
  createdAt: any;
}

export function useFirebaseVAR() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [savedReviews, setSavedReviews] = useState<SavedReviewRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Test connection & monitor auth state
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Listen for real-time review logs from Firestore only when user is authenticated
  useEffect(() => {
    if (!authReady || !currentUser) {
      setSavedReviews([]);
      return;
    }

    const reviewsPath = 'reviews';
    const unsubscribe = onSnapshot(
      collection(db, reviewsPath),
      snapshot => {
        const list: SavedReviewRecord[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as SavedReviewRecord);
        });
        setSavedReviews(list);
      },
      error => {
        handleFirestoreError(error, OperationType.GET, reviewsPath);
      }
    );

    return () => unsubscribe();
  }, [authReady, currentUser]);

  // Save official review action to Firestore
  const logReviewDecision = async (
    incident: MatchIncident,
    decision: string,
    refereeAction: 'CONFIRMED' | 'OVERTURNED'
  ) => {
    if (!currentUser) return;
    setIsSaving(true);
    const reviewId = `rev-${Date.now()}`;
    const path = `reviews/${reviewId}`;

    try {
      await setDoc(doc(db, 'reviews', reviewId), {
        id: reviewId,
        incidentId: incident.id,
        userId: currentUser.uid,
        userEmail: currentUser.email || 'referee@varapex.com',
        recommendedDecision: decision,
        refereeAction,
        confidenceScore: incident.defaultAiVerdict.confidenceScore,
        createdAt: serverTimestamp(),
      });

      // Also persist/update incident dossier in /incidents
      const incidentPath = `incidents/${incident.id}`;
      await setDoc(
        doc(db, 'incidents', incident.id),
        {
          id: incident.id,
          title: incident.title,
          matchFixture: incident.matchFixture,
          matchMinute: incident.matchMinute,
          incidentType: incident.incidentType,
          initialOnFieldCall: incident.initialOnFieldCall,
          finalDecision: decision,
          description: incident.description,
          notes: `Decision recorded: ${refereeAction} (${decision}) by ${currentUser.displayName || currentUser.email}`,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    currentUser,
    authReady,
    savedReviews,
    isSaving,
    loginWithGoogle,
    logoutUser,
    logReviewDecision,
  };
}
