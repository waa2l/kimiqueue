

// استبدل هذه القيم بمفاتيح مشروعك الجديد من Supabase Settings -> API
const SUPABASE_URL = 'https://dkvefbjgsnhrkjpwprux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrdmVmYmpnc25ocmtqcHdwcnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTQ5MDksImV4cCI6MjA4MDYzMDkwOX0.fZxEFQc9iUtqX6XEtuuy_XfRIMp9oR3RKmJ84rUzyGw';

// التأكد من تحميل مكتبة Supabase
if (typeof supabase !== 'undefined') {
    // إنشاء العميل وربطه بالنافذة (Window)
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // إنشاء الكائن المساعد (Helpers) الذي تستخدمه الصفحات
    window.supabaseHelpers = {
        // دالة جلب العيادات
        getClinics: async () => {
            const { data, error } = await window.supabaseClient
                .from('clinics')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) {
                console.error('Error fetching clinics:', error);
                return [];
            }
            return data;
        },

        // دالة الاشتراك في التحديثات الفورية (Realtime)
        subscribeToClinicUpdates: (callback) => {
            window.supabaseClient
                .channel('clinics-changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'clinics' },
                    (payload) => {
                        callback(payload);
                    }
                )
                .subscribe();
        },

        // دالة تحديث رقم العيادة (للأطباء)
        updateClinicNumber: async (clinicId, newNumber) => {
            const { data, error } = await window.supabaseClient
                .from('clinics')
                .update({ current_number: newNumber, last_call: new Date() })
                .eq('id', clinicId);
                
            if (error) console.error('Error updating:', error);
        }
    };
} else {
    console.error('Supabase library not loaded!');
}
