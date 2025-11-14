const API_URL = 'http://localhost:5000/api';

// تست ورود ورزشکار
async function testAthleteLogin() {
    console.log('\n🧪 تست ورود ورزشکار...');

    try {
        const response = await fetch(`${API_URL}/member-auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'ali.ahmadi',
                password: '123456'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ ورود موفق!');
            console.log('👤 کاربر:', data.user);
            console.log('🔑 Token:', data.token.substring(0, 50) + '...');
            return data.token;
        } else {
            console.log('❌ خطا:', data.error);
            return null;
        }
    } catch (error) {
        console.error('❌ خطا در ارتباط با سرور:', error.message);
        return null;
    }
}

// تست ورود مربی
async function testCoachLogin() {
    console.log('\n🧪 تست ورود مربی...');

    try {
        const response = await fetch(`${API_URL}/member-auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'sara.mohammadi',
                password: '123456'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ ورود موفق!');
            console.log('👤 کاربر:', data.user);
            console.log('🔑 Token:', data.token.substring(0, 50) + '...');
            return data.token;
        } else {
            console.log('❌ خطا:', data.error);
            return null;
        }
    } catch (error) {
        console.error('❌ خطا در ارتباط با سرور:', error.message);
        return null;
    }
}

// تست دریافت داشبورد ورزشکار
async function testAthleteDashboard(token) {
    console.log('\n🧪 تست داشبورد ورزشکار...');

    try {
        const response = await fetch(`${API_URL}/member-dashboard/athlete`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ دریافت داشبورد موفق!');
            console.log('📊 اطلاعات عضو:', data.data.member);
            console.log('📅 آمار حضور:', data.data.attendance.stats);
            console.log('💰 تعداد تراکنش‌ها:', data.data.financial.transactions.length);
        } else {
            console.log('❌ خطا:', data.error);
        }
    } catch (error) {
        console.error('❌ خطا در ارتباط با سرور:', error.message);
    }
}

// تست دریافت داشبورد مربی
async function testCoachDashboard(token) {
    console.log('\n🧪 تست داشبورد مربی...');

    try {
        const response = await fetch(`${API_URL}/member-dashboard/coach`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ دریافت داشبورد موفق!');
            console.log('📊 اطلاعات مربی:', data.data.coach);
            console.log('👥 تعداد ورزشکاران:', data.data.athletes.length);
            console.log('📈 آمار:', data.data.stats);
        } else {
            console.log('❌ خطا:', data.error);
        }
    } catch (error) {
        console.error('❌ خطا در ارتباط با سرور:', error.message);
    }
}

// اجرای تست‌ها
async function runTests() {
    console.log('🚀 شروع تست API های ورزشکاران و مربیان...');

    // تست ورزشکار
    const athleteToken = await testAthleteLogin();
    if (athleteToken) {
        await testAthleteDashboard(athleteToken);
    }

    // تست مربی
    const coachToken = await testCoachLogin();
    if (coachToken) {
        await testCoachDashboard(coachToken);
    }

    console.log('\n✅ تست‌ها تمام شد!');
}

runTests();
