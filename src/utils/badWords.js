// src/utils/badWords.js
export const badWords = [
    '씨발', '시발', 'sibal', 'ㅅㅂ',
    '병신', '븅신', 'ㅂㅅ',
    '개새', '개색',
    '존나', 'ㅈㄴ',
    '니미', '느금',
    '꺼져', '뒤져',
    '섹스', 'sex',
    // 더 추가 가능
];

export function validateNickname(nickname) {
    // 소문자 변환
    const lower = nickname.toLowerCase();
    
    // 금지어 체크
    for (let word of badWords) {
        if (lower.includes(word)) {
            return { valid: false, reason: '부적절한 단어가 포함되어 있습니다' };
        }
    }
    
    // 길이 체크
    if (nickname.length < 2) {
        return { valid: false, reason: '닉네임은 2글자 이상이어야 합니다' };
    }
    if (nickname.length > 10) {
        return { valid: false, reason: '닉네임은 10글자 이하여야 합니다' };
    }
    
    // 특수문자 체크
    const specialChars = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/;
    if (specialChars.test(nickname)) {
        return { valid: false, reason: '특수문자는 사용할 수 없습니다' };
    }
    
    return { valid: true };
}