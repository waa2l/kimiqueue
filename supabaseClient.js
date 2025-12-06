// supabaseClient.js
const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    window.supabaseHelpers = {
        // جلب العيادات وتحويل البيانات لتناسب الكود القديم
        getClinics: async () => {
            const { data, error } = await window.supabaseClient
                .from('clinics')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) { console.error('Error:', error); return []; }
            
            // تحويل صيغة قاعدة البيانات (current_number) إلى صيغة الكود (current)
            return data.map(c => ({
                ...c,
                current: c.current_number, // Mapping
                lastCall: c.last_call ? new Date(c.last_call).toLocaleTimeString('ar-EG') : '-'
            }));
        },

        // تحديث الرقم (يستخدم في لوحة التحكم)
        updateQueue: async (clinicId, newNumber) => {
            const { error } = await window.supabaseClient
                .from('clinics')
                .update({ 
                    current_number: newNumber,
                    last_call: new Date().toISOString()
                })
                .eq('id', clinicId);
            if (error) console.error('Error updating:', error);
        },

        // الاشتراك في التحديثات الفورية (للشاشات)
        subscribeToClinicUpdates: (callback) => {
            window.supabaseClient
                .channel('public:clinics')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'clinics' }, (payload) => {
                    // تحويل البيانات الجديدة قبل إرسالها للشاشة
                    const newData = payload.new;
                    if(newData) {
                        newData.current = newData.current_number;
                    }
                    callback(newData);
                })
                .subscribe();
        }
    };
    console.log("Supabase Helpers Loaded!");
}
