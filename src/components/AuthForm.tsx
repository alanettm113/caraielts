'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

interface AuthFormProps {
    type: 'login' | 'register' | 'forgot-password';
    }

    const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
        if (type === 'forgot-password') {
        alert('Liên kết đặt lại mật khẩu đã được gửi!');
        router.push('/auth/login');
        } else {
        router.push('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
            <div className="flex justify-center mb-6">
            <Image src="/ci-icon.png" alt="CARA IELTS Logo" width={64} height={64} />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">
            {type === 'login' ? 'Đăng nhập' : type === 'register' ? 'Đăng ký' : 'Quên mật khẩu'}
            </h1>
            <div className="space-y-4">
            {type === 'register' && (
                <div>
                <label className="block text-sm font-semibold mb-1">Họ và tên</label>
                <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                </div>
            )}
            {(type === 'login' || type === 'register' || type === 'forgot-password') && (
                <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                </div>
            )}
            {(type === 'login' || type === 'register') && (
                <div>
                <label className="block text-sm font-semibold mb-1">Mật khẩu</label>
                <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                </div>
            )}
            {type === 'register' && (
                <div>
                <label className="block text-sm font-semibold mb-1">Xác nhận mật khẩu</label>
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                </div>
            )}
            <button
                className="w-full bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
                onClick={handleSubmit}
            >
                {type === 'login' ? 'Đăng nhập' : type === 'register' ? 'Đăng ký' : 'Gửi liên kết đặt lại'}
            </button>
            <div className="text-center text-sm">
                {type === 'login' && (
                <>
                    <a href="/auth/forgot-password" className="text-amber-500 hover:underline">
                    Quên mật khẩu?
                    </a>
                    <span className="mx-2">|</span>
                    <a href="/auth/register" className="text-amber-500 hover:underline">
                    Đăng ký
                    </a>
                </>
                )}
                {type === 'register' && (
                <a href="/auth/login" className="text-amber-500 hover:underline">
                    Đã có tài khoản? Đăng nhập
                </a>
                )}
                {type === 'forgot-password' && (
                <a href="/auth/login" className="text-amber-500 hover:underline">
                    Quay lại đăng nhập
                </a>
                )}
            </div>
            </div>
        </div>
        </div>
    );
};

export default AuthForm;