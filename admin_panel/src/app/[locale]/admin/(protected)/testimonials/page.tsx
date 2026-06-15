/**
 * =====================================================
 * صفحة آراء العملاء
 * تعرض شهادات العملاء وتدير ظهورها في الموقع العام
 * =====================================================
 */

import { AdminCustomerTabs } from "@/shared/admin/components/AdminCustomerTabs";
import { AdminTestimonialsPage, type AdminTestimonialsLabels } from "@/shared/admin/components/AdminTestimonialsPage";
import type { Locale } from "@/shared/design-system/utils/direction";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function getLabels(locale: Locale): AdminTestimonialsLabels {
  if (locale === "ar") {
    return {
      eyebrow: "إدارة المحتوى",
      title: "آراء العملاء",
      description: "إدارة شهادات العملاء التي تظهر في الموقع العام، مع التحكم بالتقييم والصورة والترتيب وحالة النشر.",
      refresh: "تحديث",
      create: "إضافة رأي عميل",
      edit: "تعديل الرأي",
      preview: "معاينة الرأي",
      search: "بحث",
      searchPlaceholder: "ابحث باسم العميل أو الشركة أو نص الرأي...",
      statusFilter: "الحالة",
      all: "الكل",
      active: "منشور",
      inactive: "مخفي",
      deleted: "محذوف",
      loading: "جاري تحميل آراء العملاء...",
      error: "تعذر تحميل آراء العملاء.",
      emptyTitle: "لا توجد آراء عملاء",
      emptyDescription: "أضف أول رأي عميل ليظهر في الموقع العام ضمن قسم آراء العملاء.",
      save: "حفظ الرأي",
      cancel: "إلغاء",
      close: "إغلاق",
      delete: "حذف",
      restore: "استعادة",
      activate: "نشر",
      deactivate: "إخفاء",
      openImage: "فتح الصورة",
      confirmDeleteTitle: "حذف رأي العميل",
      confirmDeleteDescription: "سيتم إخفاء هذا الرأي من لوحة التحكم والموقع العام مع إمكانية استعادته لاحقًا.",
      confirmDelete: "نعم، حذف",
      messages: {
        saved: "تم حفظ رأي العميل بنجاح.",
        deleted: "تم حذف رأي العميل.",
        restored: "تم استعادة رأي العميل.",
        failed: "حدث خطأ أثناء تنفيذ العملية."
      },
      stats: {
        total: "إجمالي الآراء",
        active: "منشورة",
        inactive: "مخفية",
        deleted: "محذوفة",
        averageRating: "متوسط التقييم"
      },
      fields: {
        clientName: "اسم العميل",
        companyName: "اسم الشركة",
        position: "المنصب",
        textAr: "نص الرأي بالعربية",
        textEn: "نص الرأي بالإنجليزية",
        rating: "التقييم",
        imageUrl: "صورة العميل / الشعار",
        sortOrder: "ترتيب الظهور",
        isActive: "حالة النشر",
        createdAt: "تاريخ الإضافة",
        actions: "الإجراءات"
      },
      placeholders: {
        clientName: "مثال: أحمد الخطيب",
        companyName: "مثال: شركة النور التجارية",
        position: "مثال: المدير التنفيذي",
        textAr: "اكتب رأي العميل بالعربية...",
        textEn: "Write the testimonial in English...",
        imageUrl: "/uploads/media/client.jpg"
      }
    };
  }

  return {
    eyebrow: "Content Management",
    title: "Testimonials",
    description: "Manage client testimonials displayed on the public website, including rating, image, ordering, and publish state.",
    refresh: "Refresh",
    create: "Add testimonial",
    edit: "Edit testimonial",
    preview: "Preview testimonial",
    search: "Search",
    searchPlaceholder: "Search by client, company, or testimonial text...",
    statusFilter: "Status",
    all: "All",
    active: "Published",
    inactive: "Hidden",
    deleted: "Deleted",
    loading: "Loading testimonials...",
    error: "Failed to load testimonials.",
    emptyTitle: "No testimonials yet",
    emptyDescription: "Add the first client testimonial to display it on the public website.",
    save: "Save testimonial",
    cancel: "Cancel",
    close: "Close",
    delete: "Delete",
    restore: "Restore",
    activate: "Publish",
    deactivate: "Hide",
    openImage: "Open image",
    confirmDeleteTitle: "Delete testimonial",
    confirmDeleteDescription: "This testimonial will be hidden from the dashboard and public website, but can be restored later.",
    confirmDelete: "Yes, delete",
    messages: {
      saved: "Testimonial saved successfully.",
      deleted: "Testimonial deleted.",
      restored: "Testimonial restored.",
      failed: "Something went wrong while performing the action."
    },
    stats: {
      total: "Total testimonials",
      active: "Published",
      inactive: "Hidden",
      deleted: "Deleted",
      averageRating: "Average rating"
    },
    fields: {
      clientName: "Client name",
      companyName: "Company",
      position: "Position",
      textAr: "Arabic testimonial",
      textEn: "English testimonial",
      rating: "Rating",
      imageUrl: "Client image / logo",
      sortOrder: "Display order",
      isActive: "Publish state",
      createdAt: "Created at",
      actions: "Actions"
    },
    placeholders: {
      clientName: "Example: Ahmad Al-Khatib",
      companyName: "Example: Al Noor Trading",
      position: "Example: CEO",
      textAr: "Write the testimonial in Arabic...",
      textEn: "Write the testimonial in English...",
      imageUrl: "/uploads/media/client.jpg"
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ar";

  return (
    <div className="grid gap-5">
      <AdminCustomerTabs locale={locale} activeKey="testimonials" />
      <AdminTestimonialsPage locale={locale} labels={getLabels(locale)} />
    </div>
  );
}
