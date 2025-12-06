const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

// التحقق من تحميل مكتبة Supabase
if (typeof supabase !== 'undefined') {
    // 1. إنشاء الاتصال
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 2. إنشاء الدوال المساعدة التي تستخدمها صفحات HTML
    window.supabaseHelpers = {
        // جلب قائمة العيادات
        getClinics: async () => {
            const { data, error } = await window.supabaseClient
                .from('clinics')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) {
                console.error('Error loading clinics:', error);
                return [];
            }
            return data;
        },

        // الاستماع للتحديثات الحية (Realtime)
        subscribeToClinicUpdates: (callback) => {
            window.supabaseClient
                .channel('public:clinics')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'clinics' }, (payload) => {
                    console.log('Change received!', payload);
                    callback(payload);
                })
                .subscribe();
        },
        
        // دالة لتحديث الأرقام (تستخدم في لوحة التحكم)
        updateQueue: async (clinicId, newNumber) => {
             const { error } = await window.supabaseClient
                .from('clinics')
                .update({ current_number: newNumber })
                .eq('id', clinicId);
             if(error) console.error(error);
        }
    };
    console.log("Supabase Connected Successfully!");
} else {
    console.error("Supabase library not loaded. Make sure script tags are in correct order.");
}
