// supabaseClient.js - النسخة المحدثة (شاملة الميزات الجديدة)
const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded!');
} else {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created');

    window.supabaseHelpers = {
        // --- AUTH ---
        signInWithGoogle: async function() {
            const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.href }
            });
            return data;
        },
        signOut: async function() {
            const { error } = await window.supabaseClient.auth.signOut();
            if (!error) window.location.reload();
        },
        getCurrentUser: async function() {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            return user;
        },

        // --- SPECIALTIES (توحيد التخصصات) ---
        getUniqueSpecialties: async function() {
            try {
                // جلب التخصصات من جدول الأطباء لضمان تطابقها
                const { data, error } = await window.supabaseClient
                    .from('doctors')
                    .select('specialty');
                
                if (error) throw error;
                
                // استخراج التخصصات الفريدة فقط
                const unique = [...new Set(data.map(item => item.specialty))];
                return unique.filter(s => s); // إزالة القيم الفارغة
            } catch (error) {
                console.error('Error fetching specialties:', error);
                return ['طب الأسرة', 'الباطنية', 'الأطفال', 'النساء', 'الأسنان', 'الجلدية']; // قائمة احتياطية
            }
        },

        // --- CONSULTATIONS ---
        addConsultation: async function(consultationData) {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (user) consultationData.user_id = user.id;

            const { data, error } = await window.supabaseClient
                .from('consultations')
                .insert([consultationData])
                .select();
            return error ? null : data[0];
        },

        // جلب الاستشارات المفتوحة حسب التخصص (للطبيب)
        getPendingConsultationsBySpecialty: async function(specialty) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('consultations')
                    .select('*')
                    .eq('status', 'pending')
                    .eq('specialty', specialty)
                    .order('created_at', { ascending: true });
                return error ? [] : data;
            } catch (error) { return []; }
        },

        // جلب استشارات طبيب معين (الأرشيف)
        getDoctorHistory: async function(doctorId) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('consultations')
                    .select('*')
                    .eq('doctor_id', doctorId) // الاستشارات التي رد عليها هذا الطبيب
                    .eq('status', 'completed')
                    .order('updated_at', { ascending: false });
                return error ? [] : data;
            } catch (error) { return []; }
        },

        getConsultationByNumber: async function(num) {
            const { data, error } = await window.supabaseClient
                .from('consultations')
                .select('*, doctors(name)')
                .eq('consultation_number', num)
                .single();
            return error ? null : data;
        },

        getMyConsultations: async function(userId) {
            const { data, error } = await window.supabaseClient
                .from('consultations')
                .select('*, doctors(name)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            return error ? [] : data;
        },

        updateConsultation: async function(id, updates) {
            const { error } = await window.supabaseClient
                .from('consultations')
                .update(updates)
                .eq('id', id);
            return !error;
        },

        // --- DOCTORS & STAFF ---
        getDoctors: async function() {
            const { data, error } = await window.supabaseClient
                .from('doctors')
                .select('*, clinics(name)');
            return error ? [] : data;
        },

        // --- ATTENDANCE (الحضور) ---
        getAttendanceHistory: async function(doctorId) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('attendance')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .order('date', { ascending: false });
                return error ? [] : data;
            } catch (error) { return []; }
        },

        checkIn: async function(doctorId) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('attendance')
                    .insert([{
                        doctor_id: doctorId,
                        date: new Date().toISOString().split('T')[0],
                        check_in: new Date().toISOString()
                    }])
                    .select();
                return error ? null : data[0];
            } catch (error) { return null; }
        },

        checkOut: async function(attendanceId) {
            // حساب ساعات العمل عند الانصراف (بشكل تقريبي)
            // في التطبيق الفعلي يفضل حسابها في الباك إند أو عند الجلب
            try {
                const now = new Date();
                const { error } = await window.supabaseClient
                    .from('attendance')
                    .update({ 
                        check_out: now.toISOString(),
                        // total_hours يمكن حسابه لاحقاً أو هنا إذا كان لدينا وقت الدخول
                    })
                    .eq('id', attendanceId);
                return !error;
            } catch (error) { return false; }
        },

        // --- LEAVE REQUESTS (الإجازات) ---
        getDoctorLeaves: async function(doctorId) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('leave_requests')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .order('created_at', { ascending: false });
                return error ? [] : data;
            } catch (error) { return []; }
        },

        addLeaveRequest: async function(requestData) {
            const { data, error } = await window.supabaseClient
                .from('leave_requests')
                .insert([requestData])
                .select();
            return error ? null : data[0];
        },

        // --- OTHER ---
        getClinics: async function() { /* ... كما في الكود السابق ... */ 
             const { data } = await window.supabaseClient.from('clinics').select('*'); return data || []; 
        },
        // باقي الدوال (Appointments, etc.) تبقى كما هي...
    };
    console.log('✅ Supabase Helpers Loaded!');
}
