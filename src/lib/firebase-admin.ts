// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Service account credentials directly embedded
const serviceAccount = {
  projectId: 'truth-lens-1',
  clientEmail: 'firebase-adminsdk-fbsvc@truth-lens-1.iam.gserviceaccount.com',
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDMfknOkSu/KmUO\niqb7LenNmLtZmZ0wvrYK5Qo3aRNtSaI0SZlzIkwyJSCAJMFsXn2RqLGyM6BN45+x\n3o3eqLrq9LxuJ4tENqVFKz9mG53J1Jfe3ITpWRNrLQa+D+TJ1edA3GJQcxIkLbgl\nspLd4/dnTfBUztfiqZLdPj1tWcrfy5vuWvCztJq5qAoA++Xp/IG5VDvU/nCsJ0Ly\ni827B9XcXUVcCNEFjxpquXcYP7lpEx14zqou+AGHJGmjk3nFtAY1sFt8KcFnW0Vv\nLuCEeRu6aw+u3y4fdElaoLiZzZSyWeAunwo16fFj32RRtqLt0QKmT7xlhPTCyEZX\nJPatO8AHAgMBAAECggEAFBZehKwtxztp+uNm1lFvxpKEUNLH2W2nPATv6HqDZIUx\nQ4A5UreueW+8Z6oOPM/ZXarb1BzBi47BDwiRshFFomZEPj1wyKFMW2UnEKfE0hP2\nj5Dk43eTDA07vNIBEBlZfCPjhAvE3yK4lJQ1wuMti3HHmmUV8td9rD4v0laM/0er\nDCu9Oik0crt+JSBHLD4N2CB4xl8Y6UsEJEcwcH+tVAgx3xjLJrLcFKadMMThjX2g\noUJwQvZu0j3hSNcZihXQw8se+V1QuK0pFgFhvkkT8zeYcyGD5PxQ3eO+lexgXgYG\n8P4pQ9oWgTxSpBjyynkNGtXAeUPxfebpB4lwy7q/sQKBgQDt1Jl7Jq/wv1/gMhP/\nobwruYiStqg/6hRp6sJwotzdk9iiXEsCMx3KS+1xoGnIhS315yx8IFM4O6ZrQT/i\nUmTMWJWBWM12CrFnO4mFBXIEErVHhCGtDy1mOzGLsmSspwldbW/Ds2bibHbBMga0\nlq8xE1xJdT0UkEDCijDodXRZ0QKBgQDcHbFq8gCILeRpbLsy6wDm8jX/hxvOm9Bb\nqUES41SXcwbbhLUkGp77FLBPmaA0Y8VKGRa/l4SEXKm4FNbwTr8lDtIS+M/ESTX6\n6fon69uXWuaVcNIiNNE22nTGgSI/PRLX6op73O3hAx9kwiJ+HdgIv+NT3W1ZR0BP\nHPKD6vIaVwKBgFgpZTO3paTS7FGJfsxWQhDbV/s65qe6uBKDSczDMqiYs8eL+uo3\n1KU2/DAQzOXeKKltJppkyTShOBGuQGY/MMpnVBR8vL0zPYwND+9Vk2xbGwQFwQ4M\nAEJTUwx79sHhsaEGflXHXS42EtePGdk7unmwuZcpdJj42GjFHVguohDhAoGANkW/\n/A2FYg5mtjPQCGL3SvpHpCSND6lNe3xFBkI1Fk6PT0ruWuORdXkJa+cGIETFXVrI\nSB801mn+ktvYj1HrQVjhJTpiCBTBEYflXTiDYVNRbWFu/m4lc6/zgQpQBmWposE6\nugWkRYm+kNppJM14+ddOVtxO3Od7jMYnaa1hWmsCgYAf7WKev89nAXO2MsFxxtX0\n9gGzl/Ruq7juUZvx5Y1vvlvGlOoMRsgdoh+yUOpM8I+T9UVSfzJ/AADpFpjg+cm9\nu0SAOih7g2xYxB88EfVAgSfFroZb9wpvwPeBNwcuwO6VGlPcjVh7wDjMgwFvhiaX\nzatEpJEfS9NP/hbnyQRTjA==\n-----END PRIVATE KEY-----\n',
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error', error.stack);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
