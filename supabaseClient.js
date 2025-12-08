// supabaseClient.js - متوافق مع قاعدة البيانات النهائية
const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded!');
} else {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client ready');

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

        // --- SPECIALTIES ---
        getUniqueSpecialties: async function() {
            try {
                const { data, error } = await window.supabaseClient
                    .from('doctors')
                    .select('specialty');
                if (error) throw error;
                const unique = [...new Set(data.map(item => item.specialty))];
                return unique.filter(s => s);
            } catch (error) {
                return ['طب الأسرة', 'الباطنية', 'الأطفال', 'النساء', 'الأسنان', 'الجلدية'];
            }
        },

        // --- CONSULTATIONS ---
        addConsultation: async function(consultationData) {
            // جلب المستخدم الحالي لربط الاستشارة به
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (user) consultationData.user_id = user.id;

            const { data, error } = await window.supabaseClient
                .from('consultations')
                .insert([consultationData])
                .select();
            
            if (error) console.error("Error adding consultation:", error);
            return error ? null : data[0];
        },

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

        getDoctorHistory: async function(doctorId) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('consultations')
                    .select('*')
                    .eq('doctor_id', doctorId)
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

        // --- DOCTORS ---
        getDoctors: async function() {
            const { data, error } = await window.supabaseClient
                .from('doctors')
                .select('*, clinics(name)');
            return error ? [] : data;
        },

        // --- ATTENDANCE ---
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
            try {
                const now = new Date();
                const { error } = await window.supabaseClient
                    .from('attendance')
                    .update({ check_out: now.toISOString() })
                    .eq('id', attendanceId);
                return !error;
            } catch (error) { return false; }
        },

        // --- LEAVES ---
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

        // --- CLINICS ---
        getClinics: async function() {
             const { data } = await window.supabaseClient.from('clinics').select('*'); return data || []; 
        },
        
        // --- APPOINTMENTS ---
        addAppointment: async function(appointmentData) {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (user) appointmentData.user_id = user.id;

            const { data, error } = await window.supabaseClient
                .from('appointments')
                .insert([appointmentData])
                .select();
            return error ? null : data[0];
        },
        
        getAppointments: async function(date) {
            let query = window.supabaseClient.from('appointments').select('*, clinics(name), doctors(name)');
            if (date) query = query.eq('appointment_date', date);
            const { data } = await query.order('appointment_time', { ascending: true });
            return data || [];
        },
        
        getMyAppointments: async function(userId) {
            const { data } = await window.supabaseClient
                .from('appointments')
                .select('*, clinics(name), doctors(name)')
                .eq('user_id', userId)
                .order('appointment_date', { ascending: false });
            return data || [];
        }
    };
    console.log('✅ Supabase Helpers Loaded!');
}
