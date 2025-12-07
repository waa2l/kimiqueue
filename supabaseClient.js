// supabaseClient.js - Enhanced Version
const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    window.supabaseHelpers = {
        // ==================== CLINICS ====================
        getClinics: async () => {
            const { data, error } = await window.supabaseClient
                .from('clinics')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) { 
                console.error('Error fetching clinics:', error); 
                return []; 
            }
            
            return data.map(c => ({
                ...c,
                current: c.current_number,
                lastCall: c.last_call ? new Date(c.last_call).toLocaleTimeString('ar-EG') : '-'
            }));
        },

        getClinicsByScreen: async (screenNumber) => {
            const { data, error } = await window.supabaseClient
                .from('clinics')
                .select('*')
                .eq('screen', screenNumber)
                .order('id', { ascending: true });
            
            if (error) { 
                console.error('Error:', error); 
                return []; 
            }
            
            return data.map(c => ({
                ...c,
                current: c.current_number,
                lastCall: c.last_call ? new Date(c.last_call).toLocaleTimeString('ar-EG')
            }));
        },

        addClinic: async (clinicData) => {
            const { data, error } = await window.supabaseClient
                .from('clinics')
                .insert([{
                    name: clinicData.name,
                    number: clinicData.number,
                    screen: clinicData.screen,
                    password: clinicData.password,
                    status: 'active',
                    current_number: 0
                }])
                .select();
            
            if (error) {
                console.error('Error adding clinic:', error);
                return null;
            }
            return data[0];
        },

        updateClinic: async (clinicId, updates) => {
            const { error } = await window.supabaseClient
                .from('clinics')
                .update(updates)
                .eq('id', clinicId);
            
            if (error) console.error('Error updating clinic:', error);
            return !error;
        },

        deleteClinic: async (clinicId) => {
            const { error } = await window.supabaseClient
                .from('clinics')
                .delete()
                .eq('id', clinicId);
            
            if (error) console.error('Error deleting clinic:', error);
            return !error;
        },

        updateQueue: async (clinicId, newNumber) => {
            const { error } = await window.supabaseClient
                .from('clinics')
                .update({ 
                    current_number: newNumber,
                    last_call: new Date().toISOString()
                })
                .eq('id', clinicId);
            
            if (error) console.error('Error updating queue:', error);
            return !error;
        },

        subscribeToClinicUpdates: (callback) => {
            window.supabaseClient
                .channel('public:clinics')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'clinics' 
                }, (payload) => {
                    const newData = payload.new;
                    if(newData) {
                        newData.current = newData.current_number;
                        newData.lastCall = new Date().toLocaleTimeString('ar-EG');
                    }
                    callback(newData);
                })
                .subscribe();
        },

        // ==================== DOCTORS ====================
        getDoctors: async () => {
            const { data, error } = await window.supabaseClient
                .from('doctors')
                .select('*, clinics(name)')
                .order('id', { ascending: true });
            
            if (error) {
                console.error('Error fetching doctors:', error);
                return [];
            }
            
            return data.map(d => ({
                ...d,
                clinic: d.clinics?.name || 'غير محدد'
            }));
        },

        addDoctor: async (doctorData) => {
            const { data, error } = await window.supabaseClient
                .from('doctors')
                .insert([doctorData])
                .select();
            
            if (error) {
                console.error('Error adding doctor:', error);
                return null;
            }
            return data[0];
        },

        updateDoctor: async (doctorId, updates) => {
            const { error } = await window.supabaseClient
                .from('doctors')
                .update(updates)
                .eq('id', doctorId);
            
            if (error) console.error('Error updating doctor:', error);
            return !error;
        },

        // ==================== APPOINTMENTS ====================
        getAppointments: async (date = null) => {
            let query = window.supabaseClient
                .from('appointments')
                .select('*, clinics(name), doctors(name)')
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });
            
            if (date) {
                query = query.eq('appointment_date', date);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error fetching appointments:', error);
                return [];
            }
            
            return data;
        },

        addAppointment: async (appointmentData) => {
            const { data, error } = await window.supabaseClient
                .from('appointments')
                .insert([appointmentData])
                .select();
            
            if (error) {
                console.error('Error adding appointment:', error);
                return null;
            }
            return data[0];
        },

        updateAppointment: async (appointmentId, updates) => {
            const { error } = await window.supabaseClient
                .from('appointments')
                .update(updates)
                .eq('id', appointmentId);
            
            if (error) console.error('Error updating appointment:', error);
            return !error;
        },

        // ==================== CONSULTATIONS ====================
        getConsultations: async (status = null) => {
            let query = window.supabaseClient
                .from('consultations')
                .select('*, doctors(name, specialty)')
                .order('created_at', { ascending: false });
            
            if (status) {
                query = query.eq('status', status);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error fetching consultations:', error);
                return [];
            }
            
            return data;
        },

        addConsultation: async (consultationData) => {
            const { data, error } = await window.supabaseClient
                .from('consultations')
                .insert([{
                    ...consultationData,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (error) {
                console.error('Error adding consultation:', error);
                return null;
            }
            return data[0];
        },

        updateConsultation: async (consultationId, updates) => {
            const { error } = await window.supabaseClient
                .from('consultations')
                .update(updates)
                .eq('id', consultationId);
            
            if (error) console.error('Error updating consultation:', error);
            return !error;
        },

        // ==================== LEAVE REQUESTS ====================
        getLeaveRequests: async (doctorId = null) => {
            let query = window.supabaseClient
                .from('leave_requests')
                .select('*, doctors(name, specialty)')
                .order('created_at', { ascending: false });
            
            if (doctorId) {
                query = query.eq('doctor_id', doctorId);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error fetching leave requests:', error);
                return [];
            }
            
            return data;
        },

        addLeaveRequest: async (leaveData) => {
            const { data, error } = await window.supabaseClient
                .from('leave_requests')
                .insert([{
                    ...leaveData,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (error) {
                console.error('Error adding leave request:', error);
                return null;
            }
            return data[0];
        },

        updateLeaveRequest: async (requestId, updates) => {
            const { error } = await window.supabaseClient
                .from('leave_requests')
                .update(updates)
                .eq('id', requestId);
            
            if (error) console.error('Error updating leave request:', error);
            return !error;
        },

        // ==================== ATTENDANCE ====================
        checkIn: async (doctorId) => {
            const { data, error } = await window.supabaseClient
                .from('attendance')
                .insert([{
                    doctor_id: doctorId,
                    check_in: new Date().toISOString(),
                    date: new Date().toISOString().split('T')[0]
                }])
                .select();
            
            if (error) {
                console.error('Error checking in:', error);
                return null;
            }
            return data[0];
        },

        checkOut: async (attendanceId) => {
            const { error } = await window.supabaseClient
                .from('attendance')
                .update({ check_out: new Date().toISOString() })
                .eq('id', attendanceId);
            
            if (error) console.error('Error checking out:', error);
            return !error;
        },

        getAttendance: async (doctorId, date = null) => {
            let query = window.supabaseClient
                .from('attendance')
                .select('*')
                .eq('doctor_id', doctorId)
                .order('date', { ascending: false });
            
            if (date) {
                query = query.eq('date', date);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error fetching attendance:', error);
                return [];
            }
            
            return data;
        },

        // ==================== SETTINGS ====================
        getSettings: async () => {
            const { data, error } = await window.supabaseClient
                .from('settings')
                .select('*')
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching settings:', error);
                return null;
            }
            
            return data;
        },

        updateSettings: async (settings) => {
            const { data: existing } = await window.supabaseClient
                .from('settings')
                .select('id')
                .single();
            
            if (existing) {
                const { error } = await window.supabaseClient
                    .from('settings')
                    .update(settings)
                    .eq('id', existing.id);
                
                if (error) console.error('Error updating settings:', error);
                return !error;
            } else {
                const { error } = await window.supabaseClient
                    .from('settings')
                    .insert([settings]);
                
                if (error) console.error('Error creating settings:', error);
                return !error;
            }
        },

        // ==================== STATISTICS ====================
        getStatistics: async (date = new Date().toISOString().split('T')[0]) => {
            const { data: appointments, error: appError } = await window.supabaseClient
                .from('appointments')
                .select('*')
                .eq('appointment_date', date);
            
            const { data: clinics, error: clinicError } = await window.supabaseClient
                .from('clinics')
                .select('*')
                .eq('status', 'active');
            
            if (appError || clinicError) {
                console.error('Error fetching statistics');
                return null;
            }
            
            return {
                dailyPatients: appointments?.length || 0,
                activeClinics: clinics?.length || 0,
                avgWaitTime: 12, // يمكن حسابه من البيانات
                systemEfficiency: 94 // يمكن حسابه من البيانات
            };
        }
    };

    console.log("✅ Supabase Helpers Loaded Successfully!");
} else {
    console.error("❌ Supabase library not loaded!");
}
