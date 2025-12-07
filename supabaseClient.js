// supabaseClient.js - Fixed Version
const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

// Check if Supabase library is loaded
if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded! Make sure the script tag is correct.');
} else {
    console.log('✅ Supabase library loaded');
    
    // Create Supabase client
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created');

    // Create helper functions
    window.supabaseHelpers = {
        // ==================== CLINICS ====================
        getClinics: async function() {
            try {
                const { data, error } = await window.supabaseClient
                    .from('clinics')
                    .select('*')
                    .order('id', { ascending: true });
                
                if (error) { 
                    console.error('Error fetching clinics:', error); 
                    return []; 
                }
                
                console.log('✅ Fetched clinics:', data);
                
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

        getClinicsByScreen: async function(screenNumber) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('clinics')
                    .select('*')
                    .eq('screen', screenNumber)
                    .order('id', { ascending: true });
                
                if (error) { 
                    console.error('Error fetching clinics by screen:', error); 
                    return []; 
                }
                
                console.log(`✅ Fetched clinics for screen ${screenNumber}:`, data);
                
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
                
                if (error) {
                    console.error('Error adding clinic:', error);
                    return null;
                }
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
                
                if (error) {
                    console.error('Error updating clinic:', error);
                    return false;
                }
                console.log('✅ Clinic updated successfully');
                return true;
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
                
                if (error) {
                    console.error('Error deleting clinic:', error);
                    return false;
                }
                return true;
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
                
                if (error) {
                    console.error('Error updating queue:', error);
                    return false;
                }
                console.log(`✅ Queue updated: clinic ${clinicId} -> number ${newNumber}`);
                return true;
            } catch (error) {
                console.error('Exception in updateQueue:', error);
                return false;
            }
        },

        subscribeToClinicUpdates: function(callback) {
            try {
                const channel = window.supabaseClient
                    .channel('public:clinics')
                    .on('postgres_changes', { 
                        event: '*', 
                        schema: 'public', 
                        table: 'clinics' 
                    }, (payload) => {
                        console.log('🔔 Realtime update received:', payload);
                        const newData = payload.new;
                        if (newData) {
                            newData.current = newData.current_number || 0;
                            newData.lastCall = new Date().toLocaleTimeString('ar-EG');
                        }
                        callback(newData);
                    })
                    .subscribe((status) => {
                        console.log('Realtime subscription status:', status);
                    });
                
                console.log('✅ Subscribed to clinic updates');
                return channel;
            } catch (error) {
                console.error('Exception in subscribeToClinicUpdates:', error);
                return null;
            }
        },

        // ==================== DOCTORS ====================
        getDoctors: async function() {
            try {
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
                
                if (error) {
                    console.error('Error adding doctor:', error);
                    return null;
                }
                return data[0];
            } catch (error) {
                console.error('Exception in addDoctor:', error);
                return null;
            }
        },

        updateDoctor: async function(doctorId, updates) {
            try {
                const { error } = await window.supabaseClient
                    .from('doctors')
                    .update(updates)
                    .eq('id', doctorId);
                
                if (error) {
                    console.error('Error updating doctor:', error);
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Exception in updateDoctor:', error);
                return false;
            }
        },

        // ==================== SETTINGS ====================
        getSettings: async function() {
            try {
                const { data, error } = await window.supabaseClient
                    .from('settings')
                    .select('*')
                    .single();
                
                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching settings:', error);
                    return null;
                }
                
                return data;
            } catch (error) {
                console.error('Exception in getSettings:', error);
                return null;
            }
        },

        updateSettings: async function(settings) {
            try {
                const { data: existing } = await window.supabaseClient
                    .from('settings')
                    .select('id')
                    .single();
                
                if (existing) {
                    const { error } = await window.supabaseClient
                        .from('settings')
                        .update(settings)
                        .eq('id', existing.id);
                    
                    if (error) {
                        console.error('Error updating settings:', error);
                        return false;
                    }
                    return true;
                } else {
                    const { error } = await window.supabaseClient
                        .from('settings')
                        .insert([settings]);
                    
                    if (error) {
                        console.error('Error creating settings:', error);
                        return false;
                    }
                    return true;
                }
            } catch (error) {
                console.error('Exception in updateSettings:', error);
                return false;
            }
        },

        // ==================== STATISTICS ====================
        getStatistics: async function(date) {
            try {
                const targetDate = date || new Date().toISOString().split('T')[0];
                
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
                console.error('Exception in getStatistics:', error);
                return {
                    dailyPatients: 0,
                    activeClinics: 0,
                    avgWaitTime: 0,
                    systemEfficiency: 0
                };
            }
        }
    };

    console.log('✅ Supabase Helpers Loaded Successfully!');
    console.log('Available functions:', Object.keys(window.supabaseHelpers));
}
