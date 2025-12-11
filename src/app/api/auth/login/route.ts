import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码是必填项', success: false },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 使用Supabase Auth登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('登录失败:', error);
      return NextResponse.json(
        { error: '邮箱或密码错误', success: false },
        { status: 401 }
      );
    }

    // 更新最后登录时间
    if (data.user) {
      try {
        await prisma.user.update({
          where: { id: data.user.id },
          data: { lastLoginAt: new Date() },
        });
      } catch (dbError) {
        // 用户可能还没有数据库记录，尝试创建
        try {
          await prisma.user.create({
            data: {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name || email.split('@')[0],
              role: 'EDITOR',
              lastLoginAt: new Date(),
            },
          });
        } catch {
          // 忽略
        }
      }
    }

    // 创建响应并设置cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
      },
      session: data.session,
    });

    // 设置session cookie
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7天
      });
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30天
      });
    }

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败，请重试', success: false },
      { status: 500 }
    );
  }
}

