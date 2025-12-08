// supabaseClient.js - النسخة المحدثة (شاملة الاستشارات والمواعيد)
const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

// التحقق من تحميل مكتبة Supabase
if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded! Make sure the script tag is correct.');
} else {
    console.log('✅ Supabase library loaded');
    
    // إنشاء عميل Supabase
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created');

    // إنشاء دوال المساعدة
    window.supabaseHelpers = {
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
            } catch (error) {
                console.error('Exception in getClinics:', error);
                return [];
            }
        },

// أضف هذا الجزء داخل window.supabaseHelpers في قسم الاستشارات

getConsultationByNumber: async function(consultationNumber) {
    try {
        const { data, error } = await window.supabaseClient
            .from('consultations')
            .select('*, doctors(name)')
            .eq('consultation_number', consultationNumber)
            .single();
        
        if (error) {
            console.error('Error fetching consultation:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Exception in getConsultationByNumber:', error);
        return null;
    }
},

        
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
            } catch (error) {
                console.error('Exception in getClinicsByScreen:', error);
                return [];
            }
        },

        addClinic: async function(clinicData) {
            try {
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
                
                if (error) { console.error('Error adding clinic:', error); return null; }
                return data[0];
            } catch (error) {
                console.error('Exception in addClinic:', error);
                return null;
            }
        },

        updateClinic: async function(clinicId, updates) {
            try {
                const { error } = await window.supabaseClient
                    .from('clinics')
                    .update(updates)
                    .eq('id', clinicId);
                return !error;
            } catch (error) {
                console.error('Exception in updateClinic:', error);
                return false;
            }
        },

        deleteClinic: async function(clinicId) {
            try {
                const { error } = await window.supabaseClient
                    .from('clinics')
                    .delete()
                    .eq('id', clinicId);
                return !error;
            } catch (error) {
                console.error('Exception in deleteClinic:', error);
                return false;
            }
        },

        updateQueue: async function(clinicId, newNumber) {
            try {
                const { error } = await window.supabaseClient
                    .from('clinics')
                    .update({ 
                        current_number: newNumber,
                        last_call: new Date().toISOString()
                    })
                    .eq('id', clinicId);
                return !error;
            } catch (error) {
                console.error('Exception in updateQueue:', error);
                return false;
            }
        },

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
            } catch (error) {
                console.error('Exception in subscribeToClinicUpdates:', error);
                return null;
            }
        },

        // ==================== الأطباء (DOCTORS) ====================
        getDoctors: async function() {
            try {
                const { data, error } = await window.supabaseClient
                    .from('doctors')
                    .select('*, clinics(name)')
                    .order('id', { ascending: true });
                
                if (error) { console.error('Error fetching doctors:', error); return []; }
                
                return data.map(d => ({
                    ...d,
                    clinic: d.clinics?.name || 'غير محدد'
                }));
            } catch (error) {
                console.error('Exception in getDoctors:', error);
                return [];
            }
        },

        addDoctor: async function(doctorData) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('doctors')
                    .insert([doctorData])
                    .select();
                
                if (error) { console.error('Error adding doctor:', error); return null; }
                return data[0];
            } catch (error) {
                console.error('Exception in addDoctor:', error);
                return null;
            }
        },

        // ==================== المواعيد (APPOINTMENTS) ====================
        getAppointments: async function(date) {
            try {
                let query = window.supabaseClient
                    .from('appointments')
                    .select('*, clinics(name), doctors(name)');
                
                if (date) { query = query.eq('appointment_date', date); }
                
                const { data, error } = await query.order('appointment_time', { ascending: true });
                
                if (error) { console.error('Error fetching appointments:', error); return []; }
                return data;
            } catch (error) {
                console.error('Exception in getAppointments:', error);
                return [];
            }
        },

        addAppointment: async function(appointmentData) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('appointments')
                    .insert([appointmentData])
                    .select();
                
                if (error) { console.error('Error adding appointment:', error); return null; }
                return data[0];
            } catch (error) {
                console.error('Exception in addAppointment:', error);
                return null;
            }
        },

        // ==================== الاستشارات (CONSULTATIONS) - (تمت الإضافة) ====================
        // هذه الدالة هي التي تحتاجها صفحة consultations.html
        addConsultation: async function(consultationData) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('consultations')
                    .insert([consultationData])
                    .select();
                
                if (error) { console.error('Error adding consultation:', error); return null; }
                return data[0];
            } catch (error) {
                console.error('Exception in addConsultation:', error);
                return null;
            }
        },

        getConsultations: async function(status) {
            try {
                let query = window.supabaseClient.from('consultations').select('*');
                if (status) query = query.eq('status', status);
                
                const { data, error } = await query.order('created_at', { ascending: false });
                if (error) { console.error('Error fetching consultations:', error); return []; }
                return data;
            } catch (error) {
                console.error('Error fetching consultations:', error);
                return [];
            }
        },

        updateConsultation: async function(id, updates) {
            try {
                const { error } = await window.supabaseClient
                    .from('consultations')
                    .update(updates)
                    .eq('id', id);
                return !error;
            } catch (error) {
                console.error('Error updating consultation:', error);
                return false;
            }
        },

        // ==================== الحضور والإجازات (ATTENDANCE & LEAVES) ====================
        getAttendance: async function(doctorId, date) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('attendance')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('date', date);
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
                        check_in: new Date().toISOString(),
                        status: 'present'
                    }])
                    .select();
                return error ? null : data[0];
            } catch (error) { return null; }
        },

        checkOut: async function(attendanceId) {
            try {
                const { error } = await window.supabaseClient
                    .from('attendance')
                    .update({ check_out: new Date().toISOString() })
                    .eq('id', attendanceId);
                return !error;
            } catch (error) { return false; }
        },

        getLeaveRequests: async function(doctorId) {
             try {
                let query = window.supabaseClient.from('leave_requests').select('*');
                if (doctorId) query = query.eq('doctor_id', doctorId);
                const { data, error } = await query.order('created_at', { ascending: false });
                return error ? [] : data;
            } catch (error) { return []; }
        },

        addLeaveRequest: async function(requestData) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('leave_requests')
                    .insert([requestData])
                    .select();
                return error ? null : data[0];
            } catch (error) { return null; }
        },

        // ==================== الإعدادات والإحصائيات ====================
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

        getStatistics: async function(date) {
            try {
                const { data: clinics } = await window.supabaseClient
                    .from('clinics')
                    .select('*')
                    .eq('status', 'active');
                
                return {
                    dailyPatients: clinics?.reduce((sum, c) => sum + (c.current_number || 0), 0) || 0,
                    activeClinics: clinics?.length || 0,
                    avgWaitTime: 12,
                    systemEfficiency: 94
                };
            } catch (error) {
                return { dailyPatients: 0, activeClinics: 0, avgWaitTime: 0, systemEfficiency: 0 };
            }
        }
    };

    console.log('✅ Supabase Helpers Loaded Successfully!');
}
