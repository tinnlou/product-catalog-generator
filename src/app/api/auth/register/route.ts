import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码是必填项', success: false },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 使用Supabase Auth注册
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('注册失败:', error);
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      );
    }

    // 如果注册成功，在数据库中创建用户记录
    if (data.user) {
      try {
        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            name: name || email.split('@')[0],
            role: 'EDITOR',
          },
        });
      } catch (dbError) {
        console.error('创建用户记录失败:', dbError);
        // 不阻止注册流程
      }
    }

    return NextResponse.json({
      success: true,
      message: '注册成功！请检查邮箱完成验证。',
      user: data.user,
    });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请重试', success: false },
      { status: 500 }
    );
  }
}

