// src/components/NicknameModal.js
import { useState } from 'react';
import { validateNickname } from '../utils/badWords';

function NicknameModal({ onSubmit }) {
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        const validation = validateNickname(nickname);
        
        if (!validation.valid) {
            setError(validation.reason);
            return;
        }
        
        onSubmit(nickname);
    };

    const generateRandom = () => {
        const nouns = ['아네트','아르코','아멜리아','아사나','아야','아이시아','알레트','앨리스','에르핀','에슈르','에스피','에피카','엘레나','바나','바롱','바리에','버터','베니','베니(베니)','베루','벨라','벨리타','벨벳','블랑셰','비비','빅우드','카렌','칸나','칸타','캐시','캬롯','코미','코미(수영복)','큐이','클로에','다야','디아나','디아나(왕년)','오르','오팔','파트라','페스타','포셔','폴랑','프리클','피라','피코라','가비아','그윈','하이디','헤일리','힐데','이드','이프리트','요미','유미미','우이','제이드','죠안','쥬비','키디언','라이카','란','레비','레이지','레테','로네','로네(시장)','롤렛','루드','루포','리뉴아','리스티','리온','리츠','리코타','림','림(혼돈)','마고','마리','마에스트로 2호','마요','마요(멋짐)','마카샤','메죵','멜루나','모모','뮤트','미로','밍스','나이아','네르','네티','사리','샤샤','셀리네','셰럼','셰이디','슈로','슈팡','스노키','스피키','스피키(메이드)','시스트','시온 더 다크불릿','시저','실라','실피르','타이다','티그','티그(영웅)','우로스','쵸피'];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 1000);
        setNickname(`${noun}${num}`);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '10px',
                textAlign: 'center',
                minWidth: '300px',
                display: 'flex',           // ✅ 추가
                flexDirection: 'column',   // ✅ 세로 배치
                alignItems: 'center',      // ✅ 가로 중앙
                gap: '15px'                // ✅ 요소 간 간격
            }}>
                <h2>닉네임을 입력하세요</h2>
                
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                        setNickname(e.target.value);
                        setError('');
                    }}
                    placeholder="닉네임 (2-10글자)"
                    maxLength={10}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        marginTop: '10px',
                        marginBottom: '10px',
                        border: error ? '2px solid red' : '1px solid #ccc',
                        borderRadius: '5px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                
                {error && (
                    <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>
                        {error}
                    </div>
                )}
                
                <button
                    onClick={generateRandom}
                    style={{
                        padding: '10px 50px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    랜덤 생성
                </button>
                
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '10px 50px',
                        backgroundColor: '#FFD700',
                        color: 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    시작하기
                </button>
            </div>
        </div>
    );
}

export default NicknameModal;