// supabaseClient.js - النسخة الشاملة (All-in-One Fix)
const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded!');
} else {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client ready');

    window.supabaseHelpers = {
        // ==================== AUTH (تسجيل الدخول) ====================
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

        // ==================== العيادات (CLINICS) ====================
        getClinics: async function() {
            try {
                const { data, error } = await window.supabaseClient
                    .from('clinics')
                    .select('*')
                    .order('id', { ascending: true });
                
                if (error) { console.error('Error fetching clinics:', error); return []; }
                
                return data.map(c => ({
                    ...c,
                    current: c.current_number || 0,
                    lastCall: c.last_call ? new Date(c.last_call).toLocaleTimeString('ar-EG') : '-'
                }));
            } catch (error) { return []; }
        },

        // هذه الدالة كانت ناقصة وتسبب الخطأ في display.html
        getClinicsByScreen: async function(screenNumber) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('clinics')
                    .select('*')
                    .eq('screen', screenNumber)
                    .order('id', { ascending: true });
                
                if (error) { console.error('Error fetching clinics by screen:', error); return []; }
                
                return data.map(c => ({
                    ...c,
                    current: c.current_number || 0,
                    lastCall: c.last_call ? new Date(c.last_call).toLocaleTimeString('ar-EG') : '-'
                }));
            } catch (error) { return []; }
        },

        addClinic: async function(clinicData) {
            const { data, error } = await window.supabaseClient
                .from('clinics')
                .insert([{ ...clinicData, status: 'active', current_number: 0 }])
                .select();
            return error ? null : data[0];
        },

        updateClinic: async function(clinicId, updates) {
            const { error } = await window.supabaseClient.from('clinics').update(updates).eq('id', clinicId);
            return !error;
        },

        deleteClinic: async function(clinicId) {
            const { error } = await window.supabaseClient.from('clinics').delete().eq('id', clinicId);
            return !error;
        },

        // هذه الدالة مهمة للوحة التحكم (control.html)
        updateQueue: async function(clinicId, newNumber) {
            const { error } = await window.supabaseClient
                .from('clinics')
                .update({ 
                    current_number: newNumber,
                    last_call: new Date().toISOString()
                })
                .eq('id', clinicId);
            return !error;
        },

        // هذه الدالة مهمة للتحديث الفوري في الشاشة
        subscribeToClinicUpdates: function(callback) {
            try {
                const channel = window.supabaseClient
                    .channel('public:clinics')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'clinics' }, (payload) => {
                        const newData = payload.new;
                        if (newData) {
                            newData.current = newData.current_number || 0;
                            newData.lastCall = new Date().toLocaleTimeString('ar-EG');
                        }
                        callback(newData);
                    })
                    .subscribe();
                return channel;
            } catch (error) { return null; }
        },

        // ==================== الإعدادات (SETTINGS) ====================
        // هذه الدالة كانت ناقصة وتسبب الخطأ الثاني
        getSettings: async function() {
            try {
                const { data, error } = await window.supabaseClient.from('settings').select('*').single();
                if (error && error.code !== 'PGRST116') return null;
                return data;
            } catch (error) { return null; }
        },

        updateSettings: async function(settings) {
            try {
                const { data: existing } = await window.supabaseClient.from('settings').select('id').single();
                if (existing) {
                    await window.supabaseClient.from('settings').update(settings).eq('id', existing.id);
                } else {
                    await window.supabaseClient.from('settings').insert([settings]);
                }
                return true;
            } catch (error) { return false; }
        },

        // ==================== الأطباء (DOCTORS) ====================
        getDoctors: async function() {
            try {
                const { data, error } = await window.supabaseClient
                    .from('doctors')
                    .select('*, clinics(name)')
                    .order('id', { ascending: true });
                
                if (error) return [];
                
                return data.map(d => ({
                    ...d,
                    clinic: d.clinics?.name || 'غير محدد'
                }));
            } catch (error) { return []; }
        },

        addDoctor: async function(doctorData) {
            const { data, error } = await window.supabaseClient.from('doctors').insert([doctorData]).select();
            return error ? null : data[0];
        },

        getUniqueSpecialties: async function() {
            try {
                const { data } = await window.supabaseClient.from('doctors').select('specialty');
                const unique = [...new Set(data.map(item => item.specialty))];
                return unique.filter(s => s);
            } catch (error) {
                return ['طب الأسرة', 'الباطنية', 'الأطفال', 'النساء', 'الأسنان'];
            }
        },

        // ==================== الاستشارات (CONSULTATIONS) ====================
        addConsultation: async function(consultationData) {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (user) consultationData.user_id = user.id;

            const { data, error } = await window.supabaseClient
                .from('consultations')
                .insert([consultationData])
                .select();
            return error ? null : data[0];
        },

        getPendingConsultationsBySpecialty: async function(specialty) {
            const { data } = await window.supabaseClient
                .from('consultations')
                .select('*')
                .eq('status', 'pending')
                .eq('specialty', specialty)
                .order('created_at', { ascending: true });
            return data || [];
        },

        getDoctorHistory: async function(doctorId) {
            const { data } = await window.supabaseClient
                .from('consultations')
                .select('*')
                .eq('doctor_id', doctorId)
                .eq('status', 'completed')
                .order('updated_at', { ascending: false });
            return data || [];
        },

        getConsultationByNumber: async function(num) {
            const { data } = await window.supabaseClient
                .from('consultations')
                .select('*, doctors(name)')
                .eq('consultation_number', num)
                .single();
            return data;
        },

        getMyConsultations: async function(userId) {
            const { data } = await window.supabaseClient
                .from('consultations')
                .select('*, doctors(name)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            return data || [];
        },

        updateConsultation: async function(id, updates) {
            const { error } = await window.supabaseClient
                .from('consultations')
                .update(updates)
                .eq('id', id);
            return !error;
        },

        // ==================== المواعيد (APPOINTMENTS) ====================
        getAppointments: async function(date) {
            let query = window.supabaseClient.from('appointments').select('*, clinics(name), doctors(name)');
            if (date) query = query.eq('appointment_date', date);
            const { data } = await query.order('appointment_time', { ascending: true });
            return data || [];
        },

        addAppointment: async function(appointmentData) {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (user) appointmentData.user_id = user.id;
            
            const { data, error } = await window.supabaseClient.from('appointments').insert([appointmentData]).select();
            return error ? null : data[0];
        },

        getMyAppointments: async function(userId) {
            const { data } = await window.supabaseClient
                .from('appointments')
                .select('*, clinics(name), doctors(name)')
                .eq('user_id', userId)
                .order('appointment_date', { ascending: false });
            return data || [];
        },

        // ==================== الحضور والإجازات ====================
        getAttendanceHistory: async function(doctorId) {
            const { data } = await window.supabaseClient
                .from('attendance')
                .select('*')
                .eq('doctor_id', doctorId)
                .order('date', { ascending: false });
            return data || [];
        },

        checkIn: async function(doctorId) {
            const { data, error } = await window.supabaseClient.from('attendance').insert([{
                doctor_id: doctorId,
                date: new Date().toISOString().split('T')[0],
                check_in: new Date().toISOString()
            }]).select();
            return error ? null : data[0];
        },

        checkOut: async function(attendanceId) {
            const { error } = await window.supabaseClient
                .from('attendance')
                .update({ check_out: new Date().toISOString() })
                .eq('id', attendanceId);
            return !error;
        },

        getDoctorLeaves: async function(doctorId) {
            const { data } = await window.supabaseClient
                .from('leave_requests')
                .select('*')
                .eq('doctor_id', doctorId)
                .order('created_at', { ascending: false });
            return data || [];
        },

        addLeaveRequest: async function(requestData) {
            const { data, error } = await window.supabaseClient.from('leave_requests').insert([requestData]).select();
            return error ? null : data[0];
        }
    };

    console.log('✅ Supabase Helpers Fully Loaded!');
}
