/**
 * =====================================================
 * صفحة مكتبة الوسائط
 * إدارة الملفات المرفوعة (صور، مستندات، تحميلات).
 * =====================================================
 */

import { AdminMediaLibraryPage } from "@/shared/admin/components/AdminMediaLibraryPage";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function getLabels(locale: "ar" | "en") {
  if (locale === "ar") {
    return {
      title: "مكتبة الوسائط",
      description: "رفع وإدارة الصور وملفات التحميل لاستخدامها في الموقع والتطبيقات والأنظمة.",
      uploadTitle: "رفع ملف جديد",
      uploadDescription: "اختر ملفًا من جهازك ثم اضغط رفع.",
      chooseFile: "اختر ملفًا",
      upload: "رفع",
      refresh: "تحديث",
      search: "بحث",
      searchPlaceholder: "ابحث باسم الملف أو النص البديل...",
      copied: "تم النسخ",
      copyUrl: "نسخ الرابط",
      open: "فتح",
      saveAlt: "حفظ النص البديل",
      delete: "حذف",
      confirmDelete: "هل أنت متأكد من حذف هذا الملف؟",
      yesDelete: "نعم، احذف",
      cancel: "إلغاء",
      loading: "جاري تحميل مكتبة الوسائط...",
      emptyTitle: "لا توجد ملفات بعد",
      emptyDescription: "ابدأ برفع أول صورة أو مستند ليظهر هنا.",
      error: "تعذر تحميل مكتبة الوسائط.",
      file: "الملف",
      type: "النوع",
      size: "الحجم",
      url: "الرابط",
      altAr: "النص البديل بالعربية",
      altEn: "النص البديل بالإنجليزية",
      actions: "الإجراءات",
      uploadHint: "الحد الأقصى لحجم الملف 10 ميجابايت.",
      all: "الكل",
      images: "صور",
      documents: "مستندات",
      downloads: "تحميلات",
      other: "أخرى",
      filterByType: "تصفية بحسب النوع",
      totalFiles: "إجمالي الملفات",
      totalImages: "عدد الصور",
      totalDocuments: "عدد المستندات",
      totalSize: "الحجم الإجمالي",
      selectedFile: "الملف المختار",
      noFileSelected: "لم يتم اختيار ملف.",
      used: "مستخدم",
      unused: "غير مستخدم",
      createdAt: "تاريخ الإضافة",
      libraryTitle: "ملفات المكتبة",
      libraryDescription: "كل الصور والمستندات المتاحة للاستخدام في الموقع.",
      preview: "معاينة",
      details: "التفاصيل",
      clearFilters: "مسح التصفية",
      downloadsCount: "عدد مرات الاستخدام",
      fileDetails: "تفاصيل الملف",
    };
  }
  return {
    title: "Media Library",
    description: "Upload and manage images and downloadable files used across the site, apps, and systems.",
    uploadTitle: "Upload a new file",
    uploadDescription: "Pick a file from your device then click upload.",
    chooseFile: "Choose file",
    upload: "Upload",
    refresh: "Refresh",
    search: "Search",
    searchPlaceholder: "Search by file name or alt text...",
    copied: "Copied",
    copyUrl: "Copy URL",
    open: "Open",
    saveAlt: "Save alt text",
    delete: "Delete",
    confirmDelete: "Delete this file?",
    yesDelete: "Yes, delete",
    cancel: "Cancel",
    loading: "Loading media library...",
    emptyTitle: "No files yet",
    emptyDescription: "Upload your first image or document to see it here.",
    error: "Failed to load media library.",
    file: "File",
    type: "Type",
    size: "Size",
    url: "URL",
    altAr: "Alt text (Arabic)",
    altEn: "Alt text (English)",
    actions: "Actions",
    uploadHint: "Max file size 10 MB.",
    all: "All",
    images: "Images",
    documents: "Documents",
    downloads: "Downloads",
    other: "Other",
    filterByType: "Filter by type",
    totalFiles: "Total files",
    totalImages: "Images",
    totalDocuments: "Documents",
    totalSize: "Total size",
    selectedFile: "Selected file",
    noFileSelected: "No file selected.",
    used: "In use",
    unused: "Unused",
    createdAt: "Created at",
    libraryTitle: "Library files",
    libraryDescription: "All images and documents available across the site.",
    preview: "Preview",
    details: "Details",
    clearFilters: "Clear filters",
    downloadsCount: "Usage count",
    fileDetails: "File details",
  };
}

export default async function Page({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ar";
  return <AdminMediaLibraryPage labels={getLabels(locale)} />;
}
