// src/components/Leaderboard.js
function Leaderboard({ leaderboard, myUserId }) {
    return (
        <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '15px',
            borderRadius: '5px',
            fontFamily: 'monospace',
            zIndex: 1000,
            minWidth: '200px'
        }}>
            <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: '#FFD700',
                textAlign: 'center'
            }}>
                🏆 리더보드
            </div>
            
            {leaderboard.map((player, index) => (
                <div 
                    key={player.userId}
                    style={{
                        padding: '5px',
                        marginBottom: '5px',
                        backgroundColor: player.userId === myUserId 
                            ? 'rgba(255, 215, 0, 0.3)' 
                            : 'transparent',
                        borderRadius: '3px',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>
                        {index + 1}. {player.nickname}
                        {player.userId === myUserId && ' (나)'}
                    </span>
                    <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                        {player.score}
                    </span>
                </div>
            ))}
            
            {leaderboard.length === 0 && (
                <div style={{ textAlign: 'center', color: '#888' }}>
                    아직 플레이어가 없습니다
                </div>
            )}
        </div>
    );
}

export default Leaderboard;