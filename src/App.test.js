import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { useAuth } from './features/lobby/hooks/useAuth';
import { usePlayerCapacity } from './features/lobby/hooks/usePlayerCapacity';

jest.mock('./features/lobby/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('./features/lobby/hooks/usePlayerCapacity', () => ({
  usePlayerCapacity: jest.fn(),
}));

jest.mock('./components/NicknameModal', () => {
  return function MockNicknameModal({ onSubmit }) {
    return (
      <button onClick={() => onSubmit('테스터')} type="button">
        닉네임 입력 화면
      </button>
    );
  };
});

jest.mock('./components/Game', () => {
  return function MockGame({ userId, nickname }) {
    return <div>{`게임 시작: ${userId} / ${nickname}`}</div>;
  };
});

describe('App smoke tests', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ uid: 'user-1' });
    usePlayerCapacity.mockReturnValue(0);
  });

  test('auth 대기 중에는 로딩 상태를 보여준다', () => {
    useAuth.mockReturnValue(null);

    render(<App />);

    expect(screen.getByText('로딩중...')).toBeInTheDocument();
  });

  test('접속자가 100명 이상이면 서버 만원 화면을 보여준다', () => {
    usePlayerCapacity.mockReturnValue(100);

    render(<App />);

    expect(screen.getByText('🎃 서버 만원!')).toBeInTheDocument();
    expect(screen.getByText('현재 접속자: 100명')).toBeInTheDocument();
  });

  test('닉네임 입력 후 게임 화면으로 진입한다', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '닉네임 입력 화면' }));

    expect(screen.getByText('게임 시작: user-1 / 테스터')).toBeInTheDocument();
  });
});
