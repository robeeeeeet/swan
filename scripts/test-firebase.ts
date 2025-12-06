/**
 * Firebase接続テストスクリプト
 *
 * 使い方:
 *   npx tsx scripts/test-firebase.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// .env.local を読み込む
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// 環境変数チェック
function checkEnvironmentVariables() {
  console.log('🔍 環境変数チェック...\n');

  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
    'GEMINI_API_KEY',
  ];

  let allPresent = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.startsWith('your_')) {
      console.log(`❌ ${varName}: 未設定または無効`);
      allPresent = false;
    } else {
      // 値の一部をマスク表示
      const masked = value.length > 10
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : '***';
      console.log(`✅ ${varName}: ${masked}`);
    }
  }

  console.log('');
  return allPresent;
}

// Firebase初期化テスト
async function testFirebaseInitialization() {
  console.log('🔥 Firebase初期化テスト...\n');

  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // 既存のアプリがあれば削除
    if (getApps().length > 0) {
      console.log('既存のFirebaseアプリを検出');
    }

    const app = initializeApp(firebaseConfig);
    console.log(`✅ Firebaseアプリ初期化成功`);
    console.log(`   Project ID: ${firebaseConfig.projectId}\n`);

    return app;
  } catch (error) {
    console.error('❌ Firebase初期化エラー:', error);
    throw error;
  }
}

// Authentication テスト
async function testAuthentication() {
  console.log('🔐 Authentication テスト...\n');

  try {
    const auth = getAuth();
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    console.log(`✅ 匿名認証成功`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   匿名ユーザー: ${user.isAnonymous}\n`);

    return user;
  } catch (error: any) {
    console.error('❌ 認証エラー:', error.message);
    throw error;
  }
}

// Firestore テスト
async function testFirestore(userId: string) {
  console.log('💾 Firestore テスト...\n');

  try {
    const db = getFirestore();
    // recordsサブコレクションを使用（firestore.rulesで許可されている）
    const testCollectionRef = collection(db, `users/${userId}/records`);

    // 1. 書き込みテスト
    console.log('📝 テストドキュメント作成中...');
    const testDoc = {
      type: 'test',
      message: 'Firebase接続テスト',
      timestamp: new Date().toISOString(),
      userId,
    };

    const docRef = await addDoc(testCollectionRef, testDoc);
    console.log(`✅ ドキュメント作成成功: ${docRef.id}`);

    // 2. 読み込みテスト
    console.log('📖 テストドキュメント読み込み中...');
    const querySnapshot = await getDocs(testCollectionRef);
    console.log(`✅ ドキュメント読み込み成功: ${querySnapshot.size}件`);

    // 3. 削除テスト（テスト用レコードのみ削除）
    console.log('🗑️  テストドキュメント削除中...');
    for (const document of querySnapshot.docs) {
      const data = document.data();
      // テスト用のドキュメントのみ削除
      if (data.type === 'test' && data.message === 'Firebase接続テスト') {
        await deleteDoc(doc(db, `users/${userId}/records`, document.id));
      }
    }
    console.log(`✅ テストドキュメント削除完了\n`);

    return true;
  } catch (error: any) {
    console.error('❌ Firestoreエラー:', error.message);

    if (error.code === 'permission-denied') {
      console.error('   → セキュリティルールを確認してください');
      console.error('   → Firebase Console > Firestore > Rules');
    }

    throw error;
  }
}

// メイン実行
async function main() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🦢 Swan - Firebase接続テスト       ║');
  console.log('╚═══════════════════════════════════════╝\n');

  try {
    // 1. 環境変数チェック
    const envOk = checkEnvironmentVariables();
    if (!envOk) {
      throw new Error('環境変数が不足しています。.env.local を確認してください。');
    }

    // 2. Firebase初期化
    await testFirebaseInitialization();

    // 3. Authentication
    const user = await testAuthentication();

    // 4. Firestore
    await testFirestore(user.uid);

    // 完了
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   ✅ すべてのテストが成功しました！  ║');
    console.log('╚═══════════════════════════════════════╝\n');

    console.log('次のステップ:');
    console.log('1. Firestoreセキュリティルールをデプロイ');
    console.log('   → Firebase Console > Firestore > Rules');
    console.log('   → firestore.rules の内容をコピー＆デプロイ\n');
    console.log('2. アプリを起動して動作確認');
    console.log('   → npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ テスト失敗\n');
    console.error('トラブルシューティング:');
    console.error('1. .env.local ファイルが存在し、正しい値が設定されているか確認');
    console.error('2. Firebase Console でプロジェクトが正しく設定されているか確認');
    console.error('3. Authentication で匿名認証が有効になっているか確認');
    console.error('4. Firestore のセキュリティルールが正しく設定されているか確認\n');

    process.exit(1);
  }
}

main();
