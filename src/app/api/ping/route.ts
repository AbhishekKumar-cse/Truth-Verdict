import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    // Perform a simple read operation to check the connection
    await adminDb.collection('__test__').limit(1).get();
    
    return NextResponse.json({ success: true, message: 'Successfully connected to Firestore.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to connect to Firestore.', error: error.message }, { status: 500 });
  }
}
