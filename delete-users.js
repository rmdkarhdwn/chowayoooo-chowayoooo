const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function deleteAllUsers() {
    try {
    let nextPageToken;
    let count = 0;

    do {
        const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
        
        const uids = listUsersResult.users.map(user => user.uid);
        
        if (uids.length > 0) {
        await admin.auth().deleteUsers(uids);
        count += uids.length;
        console.log(`✅ 삭제됨: ${count}명`);
        }
        
        nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`\n🎉 총 ${count}명 삭제 완료`);
    } catch (error) {
    console.error('에러:', error);
    }
}

deleteAllUsers();
