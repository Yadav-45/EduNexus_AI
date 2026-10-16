import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import {
  Users,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  TrendingUp,
  Cpu,
  CreditCard,
  Building2,
  CalendarCheck,
  FileSpreadsheet,
  Bus,
  Package,
  FileText,
  BarChart3,
  BookOpen,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Search,
  ExternalLink,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Smartphone,
  QrCode,
  Printer,
  Download,
  ChevronRight,
  Globe,
  Activity,
  Flame,
  Zap,
  RefreshCw,
  X,
  MessageSquare,
  Calendar,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

export default function OwnerDashboard() {
  const navigate = useNavigate();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleSearch, setModuleSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Nepal localization state
  const [selectedCampus, setSelectedCampus] = useState("KTM_MAIN");
  const [calendarMode, setCalendarMode] = useState("BS"); // "BS" | "AD"
  const [currentTime, setCurrentTime] = useState("");
  const [periodTimeRemaining, setPeriodTimeRemaining] = useState("16m 40s");

  // Modals state
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showSmsSuccessToast, setShowSmsSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Payment Simulator state
  const [payGateway, setPayGateway] = useState("FONEPAY"); // "FONEPAY" | "ESEWA" | "KHALTI"
  const [payStudent, setPayStudent] = useState("Aarav Sharma · Class 10-A");
  const [payAmount, setPayAmount] = useState("14,500");
  const [payStatus, setPayStatus] = useState("IDLE"); // "IDLE" | "PROCESSING" | "SUCCESS"
  const [receiptNumber, setReceiptNumber] = useState("REC-2081-8942");

  // Bilingual AI Copilot state
  const [aiLanguage, setAiLanguage] = useState("NEP"); // "NEP" | "ENG"
  const [aiInput, setAiInput] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);
  const [aiConversation, setAiConversation] = useState([
    {
      role: "assistant",
      textNep:
        "नमस्ते प्रिन्सिपल/बोर्ड अध्यक्ष ज्यू! म एड्युनेक्स एआई (EduNexus AI) कन्सोल हुँ। म तपाईंलाई विद्यालयको आर्थिक स्थिति (eSewa/Khalti), SEE/NEB नतिजा प्रक्षेपण, शिक्षक उपस्थिति र आकस्मिक सूचनाहरू निर्माण गर्न मद्दत गर्दछु। मलाई केही सोध्नुहोस्!",
      textEng:
        "Greetings Executive Board! I am your EduNexus AI Institutional Copilot. I can assist with tuition collections (eSewa/Khalti/Fonepay), SEE/NEB Board projections, CDC curriculum grading, and urgent notice broadcasts. How may I assist you today?",
    },
  ]);

  // Notice Board state
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "जिल्ला प्रशासन कार्यालयको वर्षा सम्बन्धी पूर्वसूचना - हाइब्रिड कक्षा सञ्चालन",
      titleEng: "District Administration Monsoon Advisory - Hybrid Online Classes Enabled",
      tag: "अत्यावश्यक (URGENT)",
      tagType: "danger",
      dateBs: "२०८१ आश्विन २४",
      target: "अभिभावक तथा सम्पूर्ण विद्यार्थी",
      smsSent: true,
    },
    {
      id: 2,
      title: "कक्षा ११ र १२ को NEB दर्ता फारम तथा आन्तरिक मूल्याङ्कन बुझाउने म्याद",
      titleEng: "NEB Class 11 & 12 Registration and Internal Marks CDC Submission",
      tag: "परीक्षा (EXAM)",
      tagType: "warning",
      dateBs: "२०८१ आश्विन २०",
      target: "कक्षा ११ र १२ का विद्यार्थी",
      smsSent: true,
    },
    {
      id: 3,
      title: "बडादशैं तथा शुभ दीपावलीको पावन अवसरमा बिदा सम्बन्धी सूचना",
      titleEng: "Grand Dashain & Tihar Festival Institutional Vacation Notice",
      tag: "चाडपर्व (FESTIVAL)",
      tagType: "success",
      dateBs: "२०८१ आश्विन १८",
      target: "सम्पूर्ण विद्यार्थी, शिक्षक तथा कर्मचारी",
      smsSent: false,
    },
  ]);

  // New notice form
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeTarget, setNewNoticeTarget] = useState("ALL_PARENTS");
  const [newNoticeTag, setNewNoticeTag] = useState("URGENT");
  const [sendSmsBroadcast, setSendSmsBroadcast] = useState(true);

  // Live Clock & Period Countdown
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real users from backend
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await api.get("/users");
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.items)
        ? response.data.items
        : [];
      setUsers(data);
    } catch (error) {
      console.error("Unable to load user registry:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  // Derived user statistics
  const totalUsersCount = users.length > 0 ? users.length : 1420;
  const totalStudentsCount = users.filter((u) => u.role === "STUDENT").length || 1184;
  const totalTeachersCount = users.filter((u) => u.role === "TEACHER").length || 68;
  const totalParentsCount = users.filter((u) => u.role === "PARENT").length || 892;
  const activeUsersCount = users.filter((u) => u.is_active).length || 842;

  // AI Copilot prompt submission
  const handleAskAi = (promptText) => {
    const query = promptText || aiInput;
    if (!query.trim()) return;

    setAiGenerating(true);
    setAiConversation((prev) => [
      ...prev,
      { role: "user", textNep: query, textEng: query },
    ]);
    setAiInput("");

    setTimeout(() => {
      let nepResponse = "";
      let engResponse = "";

      const lower = query.toLowerCase();

      if (lower.includes("दशैं") || lower.includes("tihar") || lower.includes("dashain") || lower.includes("बिदा") || lower.includes("holiday")) {
        nepResponse =
          "**बडादशैं तथा तिहार बिदा सम्बन्धी सूचना मस्यौदा:**\n\nआदरणीय अभिभावक तथा प्यारा विद्यार्थीहरू,\nयस एड्युनेक्स एकेडेमीमा यही २०८१ आश्विन २८ गतेदेखि कात्तिक १४ गतेसम्म बडादशैं, तिहार तथा छठ पर्वको पावन उपलक्ष्यमा पठनपाठन बन्द रहने व्यहोरा जानकारी गराइन्छ। विद्यालय कात्तिक १५ गते शुक्रबार नियमित समयमा पुनः सञ्चालन हुनेछ। सम्पूर्णमा विजयादशमी तथा शुभ दीपावलीको हार्दिक मङ्गलमय शुभकामना!\n\n— प्रिन्सिपल / व्यवस्थापन समिति\n\n*(स्प्यारो एसएमएस मार्फत सम्पूर्ण अभिभावकलाई पठाउन तयार छ।)*";
        engResponse =
          "**Draft Notice: Grand Dashain & Tihar Holidays:**\n\nDear Respected Parents & Students,\nPlease be informed that physical and virtual classes at EduNexus Academy will remain closed from Ashwin 28 to Kartik 14, 2081 B.S. on the auspicious occasions of Bijaya Dashami, Tihar & Chhath festivals. School resumes in full schedule on Kartik 15, Friday. We wish all families radiant festive joy!\n\n— Executive Principal & Management Board";
      } else if (lower.includes("see") || lower.includes("grade") || lower.includes("कमजोर") || lower.includes("math") || lower.includes("गणित")) {
        nepResponse =
          "**SEE २०८१ गणित तथा विज्ञान विशेष योजना:**\n\n१. **वर्तमान प्रक्षेपण:** कक्षा १० मा १४२ जनामध्ये ४२ जनाले ३.६+ GPA (A+) ल्याउने सम्भावना छ, तर अनिवार्य गणितमा १२ जना विद्यार्थी ‘सीमान्त जोखिम’ (GPA < २.४) मा छन्।\n२. **उपचारात्मक कदम:** बिहान ७:०० - ८:१५ सम्म निःशुल्क ‘एआई बूस्टर क्लास’ सञ्चालन गर्ने।\n३. **नमुना प्रश्नपत्र:** CDC पाठ्यक्रम विकास केन्द्रको पछिल्लो ग्रिड अनुसार ५ सेट अभ्यास परीक्षा सञ्चालन गर्ने।\n४. **अभिभावक समन्वय:** सम्बन्धित १२ अभिभावकलाई भाइबर/एसएमएस मार्फत प्रोग्रेस कार्ड पठाउने।";
        engResponse =
          "**SEE 2081 Remedial & Distinction Strategy:**\n\n1. **Current Forecast:** Out of 142 Class 10 candidates, 44.8% are projected for A+ (3.6+ GPA). However, 12 students require urgent intervention in Compulsory Mathematics.\n2. **Action Plan:** Launch daily 7:00 AM - 8:15 AM AI Diagnostic Remedial Labs.\n3. **CDC Alignment:** Dispatch 5 full-length CDC model question papers through the Student Portal.\n4. **Parent Bridge:** Auto-trigger Viber alerts with weekly diagnostic scorecards.";
      } else if (lower.includes("fee") || lower.includes("शुल्क") || lower.includes("esewa") || lower.includes("khalti") || lower.includes("बक्यौता")) {
        nepResponse =
          "**शुल्क संकलन तथा बक्यौता उठाउने रणनीति (२०८१):**\n\n• **कुल बाँकी बक्यौता:** रू ७,५५,००० (विशेषगरी कक्षा १०-ए र कक्षा १२ विज्ञान संकायमा)।\n• **सुझाव १:** ईसेवा (eSewa) र खल्ती (Khalti) बाट ३ दिनभित्र भुक्तानी गरेमा २% छुट ( अर्ली-बर्ड डिस्काउन्ट) प्रस्ताव गर्ने।\n• **सुझाव २:** आज दिउँसो ४:०० बजे प्रणालीबाट फन्टपे QR लिंक सहितको अटो-एसएमएस (Auto-SMS) पठाउने।\n• यसले आगामी ५ दिनभित्र कम्तीमा रू ५,२०,००० तुरुन्तै असुली हुने अनुमान गरिएको छ।";
        engResponse =
          "**Tuition Recovery Optimization Strategy:**\n\n• **Outstanding Receivables:** NPR 7,55,000 (concentrated primarily in Grade 10-A and Grade 12 Science).\n• **Recommendation 1:** Offer a 2% early-bird incentive for clearing dues via eSewa / Khalti within 72 hours.\n• **Recommendation 2:** Trigger instant Fonepay dynamic QR SMS links at 4:00 PM today.\n• Projected cash inflow recovery within 5 business days: NPR 5,20,000.";
      } else {
        nepResponse = `**एआई व्यवस्थापकीय विश्लेषण:**\n\nतपाईंको प्रश्न "${query}" को आधारमा, एड्युनेक्स इन्टेलिजेन्स इन्जिनले विद्यालयको सम्पूर्ण तथ्याङ्क (उपस्थिति ९८.५%, शुल्क संकलन ९१.२%, र परीक्षा नतिजा) सामान्य भन्दा उत्कृष्ट रहेको पुष्टि गर्दछ। यदि तपाईं यस सम्बन्धी विस्तृत प्रतिवेदन पिडिएफ (PDF) वा अभिभावक सूचना चाहनुहुन्छ भने म तुरुन्त तयार गर्न सक्छु।`;
        engResponse = `**Executive Intelligence Advisory:**\n\nRegarding your inquiry "${query}": System telemetry confirms operations are running at peak institutional health (98.5% biometric presence, 91.2% fee realization rate, 44.8% projected distinction rate). I can compile a formal PDF executive dossier or broadcast an instant circular whenever you direct.`;
      }

      setAiConversation((prev) => [
        ...prev,
        { role: "assistant", textNep: nepResponse, textEng: engResponse },
      ]);
      setAiGenerating(false);
    }, 900);
  };

  // Simulate Fee Payment Processing
  const handleProcessPayment = () => {
    setPayStatus("PROCESSING");
    setTimeout(() => {
      setPayStatus("SUCCESS");
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      setReceiptNumber(`REC-2081-${randomCode}`);
      setToastMessage(
        `रू ${payAmount} सफलतापूर्वक ${payGateway} मार्फत भुक्तानी भयो! रसिद: REC-2081-${randomCode}`
      );
      setShowSmsSuccessToast(true);
      setTimeout(() => setShowSmsSuccessToast(false), 4500);
    }, 1200);
  };

  // Broadcast Notice Handler
  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;

    const newObj = {
      id: Date.now(),
      title: newNoticeTitle,
      titleEng: newNoticeTitle,
      tag: newNoticeTag === "URGENT" ? "अत्यावश्यक (URGENT)" : "सूचना (NOTICE)",
      tagType: newNoticeTag === "URGENT" ? "danger" : "warning",
      dateBs: "२०८१ आश्विन २४",
      target:
        newNoticeTarget === "ALL_PARENTS"
          ? "सम्पूर्ण अभिभावक"
          : "कक्षा १० र १२ का विद्यार्थी",
      smsSent: sendSmsBroadcast,
    };

    setNotices([newObj, ...notices]);
    setShowNoticeModal(false);
    setNewNoticeTitle("");
    setToastMessage(
      sendSmsBroadcast
        ? `नयाँ सूचना प्रकाशित भयो र ८९२ अभिभावकलाई स्प्यारो एसएमएस मार्फत पठाइयो!`
        : `नयाँ सूचना प्रकाशित गरियो!`
    );
    setShowSmsSuccessToast(true);
    setTimeout(() => setShowSmsSuccessToast(false), 4500);
  };

  // Send Bulk SMS Defaulter reminder
  const handleSendBulkFeeReminder = () => {
    setToastMessage(
      "बक्यौता बाँकी रहेका ३४ जना विद्यार्थीका अभिभावकलाई फन्टपे QR लिंक सहितको एसएमएस पठाइयो!"
    );
    setShowSmsSuccessToast(true);
    setTimeout(() => setShowSmsSuccessToast(false), 4500);
  };

  // Master Module Catalog
  const moduleCatalog = [
    // Academics
    {
      category: "ACADEMICS",
      title: "Student 360° Registry",
      description: "CDC cohorts, digital character certificates, enrollment, and student dossiers.",
      path: "/students",
      icon: GraduationCap,
      color: "var(--accent-indigo)",
    },
    {
      category: "ACADEMICS",
      title: "Attendance Ledger & Biometrics",
      description: "Automated student & faculty presence, SMS absence triggers, and biometric logs.",
      path: "/attendance",
      icon: CalendarCheck,
      color: "var(--accent-cyan)",
    },
    {
      category: "ACADEMICS",
      title: "Admissions & Intake Pipeline",
      description: "Online entrance testing, digital application review, and class allocation.",
      path: "/admissions",
      icon: Users,
      color: "var(--accent-purple)",
    },
    {
      category: "ACADEMICS",
      title: "Curriculum & Syllabus Master",
      description: "CDC national curriculum guidelines, subject codes, and lesson pacing.",
      path: "/courses",
      icon: BookOpen,
      color: "var(--accent-indigo)",
    },
    {
      category: "ACADEMICS",
      title: "Interactive Learning Engine",
      description: "Digital notes, assignments, interactive tests, and multimedia lessons.",
      path: "/learning",
      icon: Sparkles,
      color: "var(--accent-cyan)",
    },
    {
      category: "ACADEMICS",
      title: "CDC Examinations & Marksheets",
      description: "Terminal examinations, NEB ledger compilation, GPA computation, and printing.",
      path: "/academic/exams",
      icon: Award,
      color: "var(--accent-emerald)",
    },

    // Staff & HR
    {
      category: "HR_STAFF",
      title: "Faculty & Staff Directory",
      description: "Teacher dossiers, subject allocations, qualification records, and tenure.",
      path: "/staff",
      icon: Briefcase,
      color: "var(--accent-indigo)",
    },
    {
      category: "HR_STAFF",
      title: "Staff Attendance Biometrics",
      description: "Daily fingerprint/RFID logs, shift times, and late-arrival tracking.",
      path: "/staff-attendance",
      icon: CalendarCheck,
      color: "var(--accent-cyan)",
    },
    {
      category: "HR_STAFF",
      title: "Staff Leave Management",
      description: "Festival leaves, casual & medical leave requests, and executive approvals.",
      path: "/staff-leave",
      icon: FileSpreadsheet,
      color: "var(--accent-purple)",
    },
    {
      category: "HR_STAFF",
      title: "Automated Staff Payroll (NPR)",
      description: "Monthly salary generation, CIT / SSF provident deductions, and payslips.",
      path: "/staff-payroll",
      icon: CreditCard,
      color: "var(--accent-emerald)",
    },
    {
      category: "HR_STAFF",
      title: "Faculty Performance Analytics",
      description: "Student feedback scores, syllabus completion rates, and peer review metrics.",
      path: "/staff-performance",
      icon: TrendingUp,
      color: "var(--accent-amber)",
    },

    // Finance & Operations
    {
      category: "FINANCE_OPS",
      title: "Fee Collections (eSewa / Khalti)",
      description: "Tuition collection gateway, terminal dues, Fonepay QR, and fee structures.",
      path: "/fees",
      icon: CreditCard,
      color: "var(--accent-emerald)",
    },
    {
      category: "FINANCE_OPS",
      title: "Institutional Accounts Ledger",
      description: "Double-entry accounting, vendor payments, income/expense reports, and tax.",
      path: "/accounting",
      icon: Building2,
      color: "var(--accent-cyan)",
    },
    {
      category: "FINANCE_OPS",
      title: "Campus Fleet & Bus Radar",
      description: "Live GPS route tracking, fuel consumption, driver telemetry, and stops.",
      path: "/transport",
      icon: Bus,
      color: "var(--accent-amber)",
    },
    {
      category: "FINANCE_OPS",
      title: "Campus Assets & Inventory",
      description: "Lab apparatus, IT hardware, uniform depot, books, and stock audits.",
      path: "/inventory",
      icon: Package,
      color: "var(--accent-purple)",
    },
    {
      category: "FINANCE_OPS",
      title: "Document Vault & Verification",
      description: "Government compliance licenses, birth certificates, and SLC/SEE transcripts.",
      path: "/documents",
      icon: FileText,
      color: "var(--accent-indigo)",
    },

    // AI & Administration
    {
      category: "AI_ADMIN",
      title: "AI Neural Copilot & Tutor",
      description: "Autonomous lesson generator, bilingual CDC tutor, and institutional AI.",
      path: "/ai-tutor",
      icon: Cpu,
      color: "var(--accent-cyan)",
    },
    {
      category: "AI_ADMIN",
      title: "Executive Analytics Deck",
      description: "Institutional retention rate, 5-year enrollment trajectory, and forecasting.",
      path: "/analytics",
      icon: BarChart3,
      color: "var(--accent-indigo)",
    },
    {
      category: "AI_ADMIN",
      title: "Parent Portal & SMS Gateway",
      description: "Automated SMS/Viber alerts (Sparrow SMS), parent accounts, and conferences.",
      path: "/parents",
      icon: HeartHandshake,
      color: "var(--accent-purple)",
    },
    {
      category: "AI_ADMIN",
      title: "Identity & RBAC Access",
      description: "Institutional user accounts, security audits, and multi-campus credentials.",
      path: "/users",
      icon: Users,
      color: "var(--accent-emerald)",
    },
  ];

  const filteredModules = useMemo(() => {
    return moduleCatalog.filter((mod) => {
      const matchesSearch =
        !moduleSearch ||
        mod.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
        mod.description.toLowerCase().includes(moduleSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || mod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [moduleCatalog, moduleSearch, selectedCategory]);

  return (
    <AppLayout
      title="कार्यकारी अध्यक्ष तथा बोर्ड कमान्ड डेक"
      subtitle="Executive Institutional Oversight · Nepal CDC & NEB Board Standards · Digital Treasury (eSewa / Khalti)"
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Quick Action: Payment Terminal */}
          <button
            onClick={() => {
              setPayStatus("IDLE");
              setShowPaymentModal(true);
            }}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px",
              fontSize: "12.5px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontWeight: 600,
            }}
          >
            <QrCode size={15} />
            <span>ईसेवा / खल्ती भुक्तानी</span>
          </button>

          {/* Quick Action: Post Urgent Notice */}
          <button
            onClick={() => setShowNoticeModal(true)}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 14px",
              fontSize: "12.5px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#a5b4fc",
              fontWeight: 600,
            }}
          >
            <Bell size={15} />
            <span>आकस्मिक सूचना जारी</span>
          </button>
        </div>
      }
    >
      {/* SUCCESS TOAST NOTIFICATION */}
      {showSmsSuccessToast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            padding: "14px 22px",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            zIndex: 9999,
            fontWeight: 600,
            fontSize: "13.5px",
            animation: "slideInToast 0.3s ease",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setShowSmsSuccessToast(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              marginLeft: "8px",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ============================================================
          SECTION 1: NEPAL PATRO & LIVE BELL ROUTINE HERO BANNER
          ============================================================ */}
      <section
        className="card"
        style={{
          padding: "24px 28px",
          marginBottom: "26px",
          background:
            "linear-gradient(135deg, rgba(23, 32, 51, 0.95) 0%, rgba(13, 18, 30, 0.98) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-60px",
            width: "320px",
            height: "320px",
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Left: Campus & Nepali Calendar Date */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(99, 102, 241, 0.18)",
                  border: "1px solid rgba(99, 102, 241, 0.35)",
                  color: "#818cf8",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                <Building2 size={13} />
                <span>काठमाडौँ मुख्य क्याम्पस · नयाँ बानेश्वर</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(16, 185, 129, 0.14)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                  fontSize: "11.5px",
                  fontWeight: 700,
                }}
              >
                <Calendar size={13} />
                <span>शैक्षिक सत्र २०८१ / २०८२</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap" }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                {calendarMode === "BS"
                  ? "वि.सं. २०८१ आश्विन २४ गते, शुक्रबार"
                  : "Friday, October 10, 2026"}
              </h2>

              <button
                onClick={() => setCalendarMode(calendarMode === "BS" ? "AD" : "BS")}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#94a3b8",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {calendarMode === "BS" ? "Switch to A.D. (Gregorian)" : "नेपाली वि.सं. हेर्नुहोस्"}
              </button>
            </div>

            {/* Patro Highlights Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "10px",
                fontSize: "12.5px",
                color: "#e2e8f0",
              }}
            >
              <Flame size={15} style={{ color: "#f59e0b" }} />
              <span style={{ fontWeight: 600, color: "#f59e0b" }}>
                नेपाली पात्रो विशेष:
              </span>
              <span>
                बडादशैं–तिहार बिदा नजिकिँदै (६ दिन बाँकी) · द्वितीय त्रैमासिक परीक्षा मंसीर ४ देखि
              </span>
            </div>
          </div>

          {/* Right: Live Bell Routine Radar */}
          <div
            style={{
              background: "rgba(11, 15, 25, 0.75)",
              border: "1px solid rgba(6, 182, 212, 0.25)",
              borderRadius: "16px",
              padding: "16px 20px",
              minWidth: "280px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#06b6d4",
                    boxShadow: "0 0 10px #06b6d4",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#06b6d4",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  LIVE BELL RADAR
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                {currentTime} (NPT)
              </span>
            </div>

            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
              Period 4: 12:15 PM – 1:00 PM
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              कक्षा १० गणित / कक्षा १२ भौतिक विज्ञान प्रयोगशाला
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
                paddingTop: "10px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ fontSize: "11.5px", color: "#f59e0b", fontWeight: 600 }}>
                घण्टी बज्न बाँकी: <strong>{periodTimeRemaining}</strong>
              </div>
              <button
                onClick={() => setShowRoutineModal(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#67e8f9",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>सम्पूर्ण रुटिन</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: EXECUTIVE ENTERPRISE KPI HIGHLIGHTS
          ============================================================ */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        {/* KPI 1: Total Enrolled Scholars */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              कुल विद्यार्थी संख्या (SCHOLARS)
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-indigo)",
              }}
            >
              <GraduationCap size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {loading ? "..." : totalStudentsCount.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--accent-emerald)",
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: 600,
            }}
          >
            <TrendingUp size={13} />
            <span>कक्षा १ देखि १२ (+२ विज्ञान, व्यवस्थापन र कानुन)</span>
          </div>
        </div>

        {/* KPI 2: Faculty & Biometric Attendance */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              शिक्षक तथा कर्मचारी (FACULTY)
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(6, 182, 212, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
              }}
            >
              <Briefcase size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "var(--accent-cyan)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {totalTeachersCount} <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>प्राध्यापक</span>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#10b981",
              marginTop: "6px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <CheckCircle2 size={13} />
            <span>९८.५% बायोमेट्रिक हाजिरी दर्ता आज</span>
          </div>
        </div>

        {/* KPI 3: Total Fee Realization (NPR) */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              शुल्क संकलन (TOTAL NPR REVENUE)
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-emerald)",
              }}
            >
              <CreditCard size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "var(--accent-emerald)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            रू ७८,४५,०००
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ color: "#34d399", fontWeight: 700 }}>९१.२% संकलित</span>
            <span>· बाँकी बक्यौता: रू ७,५५,०००</span>
          </div>
        </div>

        {/* KPI 4: NEB & SEE Projected Distinction */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              बोर्ड नतिजा प्रक्षेपण (CDC DISTINCTION)
            </span>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-amber)",
              }}
            >
              <Award size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#f59e0b",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            ४४.८% <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>A+ (3.6+ GPA)</span>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "6px",
              fontWeight: 600,
            }}
          >
            <span>कक्षा १० SEE र कक्षा १२ NEB बोर्ड मोडेल</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: 2-COLUMN GRID:
          LEFT: eSewa / Khalti Fee Gateway Command
          RIGHT: NEB & SEE CDC 4.0 GPA Command
          ============================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "22px",
          marginBottom: "28px",
        }}
      >
        {/* COLUMN 1: eSewa / Khalti / Fonepay Fee Portal */}
        <div className="card" style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: "rgba(16, 185, 129, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10b981",
                }}
              >
                <CreditCard size={17} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  डिजिटल शुल्क संकलन तथा बक्यौता (eSewa / Khalti)
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  नेपालका प्रमुख गेटवे तथा काउन्टर संकलन विश्लेषण
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setPayStatus("IDLE");
                setShowPaymentModal(true);
              }}
              className="btn btn-secondary"
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <QrCode size={13} />
              <span>गेटवे टर्मिनल खोल्नुहोस्</span>
            </button>
          </div>

          {/* Progress Bar of Target */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12.5px",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>
                त्रैमासिक संकलन लक्ष्य (रु ८६ लाख मध्ये):
              </span>
              <strong style={{ color: "#10b981" }}>रू ७८,४५,००० (९१.२%)</strong>
            </div>
            <div
              style={{
                width: "100%",
                height: "9px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "91.2%",
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>

          {/* Payment Gateways Breakdown Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* eSewa */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                  />
                  <strong style={{ fontSize: "13px", color: "#6ee7b7" }}>
                    ईसेवा (eSewa Direct)
                  </strong>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981" }}>
                  ४२%
                </span>
              </div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginTop: "6px",
                }}
              >
                रू ३२,९४,९००
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                ४९८ अभिभावकद्वारा प्रत्यक्ष अनलाइन
              </span>
            </div>

            {/* Khalti */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(168, 85, 247, 0.08)",
                border: "1px solid rgba(168, 85, 247, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#a855f7",
                    }}
                  />
                  <strong style={{ fontSize: "13px", color: "#d8b4fe" }}>
                    खल्ती (Khalti Smart)
                  </strong>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#c084fc" }}>
                  २८%
                </span>
              </div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginTop: "6px",
                }}
              >
                रू २१,९६,६००
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                ३१२ मोबाइल वालेट कारोबार
              </span>
            </div>

            {/* Fonepay QR */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#ef4444",
                    }}
                  />
                  <strong style={{ fontSize: "13px", color: "#fca5a5" }}>
                    फन्टपे QR (Fonepay)
                  </strong>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#f87171" }}>
                  १८%
                </span>
              </div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginTop: "6px",
                }}
              >
                रू १४,१२,१००
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                मोबाइल बैंकिङ इन्टरब्याङ्क QR
              </span>
            </div>

            {/* Cash / Counter */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#94a3b8",
                    }}
                  />
                  <strong style={{ fontSize: "13px", color: "#cbd5e1" }}>
                    काउन्टर नगद / चेक
                  </strong>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>
                  १२%
                </span>
              </div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginTop: "6px",
                }}
              >
                रू ९,४१,४००
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                भौतिक काउन्टर रसिद
              </span>
            </div>
          </div>

          {/* Arrears Watchlist & 1-Click SMS Reminder */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#f59e0b",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                <AlertTriangle size={15} />
                <span>बक्यौता चेतावनी: ३४ जना विद्यार्थीको शुल्क बाँकी</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                कक्षा १०-ए (रू १,२६,०००) र कक्षा १२ विज्ञान (रू १,९८,०००) मा अधिक बक्यौता
              </span>
            </div>

            <button
              onClick={handleSendBulkFeeReminder}
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.35)",
              }}
            >
              <Send size={13} />
              <span>१-क्लिक स्प्यारो SMS / भाइबर पठाउनुहोस्</span>
            </button>
          </div>
        </div>

        {/* COLUMN 2: NEB & SEE 4.0 GPA Command & CDC Grading */}
        <div className="card" style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: "rgba(245, 158, 11, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f59e0b",
                }}
              >
                <Award size={17} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  NEB / SEE बोर्ड परीक्षा प्रक्षेपण (CDC ४.० GPA)
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  नेपाल पाठ्यक्रम विकास केन्द्र (CDC) ९-स्तरिय अक्षराङ्कन पद्धति
                </span>
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "rgba(99, 102, 241, 0.12)",
                color: "#818cf8",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              <Clock size={12} />
              <span>SEE: १३८ दिन बाँकी</span>
            </div>
          </div>

          {/* CDC 9-Grade Distribution Progress Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {/* A+ */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#34d399", fontWeight: 700 }}>
                  A+ (3.6 – 4.0 GPA) · विशिष्ट श्रेणी (Distinction)
                </span>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>
                  ४४.८% (१४२ विद्यार्थी)
                </span>
              </div>
              <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                <div style={{ width: "44.8%", height: "100%", background: "#10b981", borderRadius: "99px" }} />
              </div>
            </div>

            {/* A */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                  A (3.2 – 3.6 GPA) · उत्कृष्ट (Excellent)
                </span>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>
                  ३१.२% (९८ विद्यार्थी)
                </span>
              </div>
              <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                <div style={{ width: "31.2%", height: "100%", background: "#06b6d4", borderRadius: "99px" }} />
              </div>
            </div>

            {/* B+ */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#a78bfa", fontWeight: 700 }}>
                  B+ (2.8 – 3.2 GPA) · धेरै राम्रो (Very Good)
                </span>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>
                  १६.५% (५२ विद्यार्थी)
                </span>
              </div>
              <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                <div style={{ width: "16.5%", height: "100%", background: "#8b5cf6", borderRadius: "99px" }} />
              </div>
            </div>

            {/* B and below */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                  B / C / D (2.0 – 2.8 GPA) · राम्रो तथा सन्तोषजनक
                </span>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>
                  ७.१% (२२ विद्यार्थी)
                </span>
              </div>
              <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                <div style={{ width: "7.1%", height: "100%", background: "#f59e0b", borderRadius: "99px" }} />
              </div>
            </div>

            {/* NG (Non-Graded Alert) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#f87171", fontWeight: 700 }}>
                  NG (Non-Graded Alert - ग्रेड अवर्गीकृत जोखिम)
                </span>
                <span style={{ color: "#f87171", fontWeight: 800 }}>
                  ०.४% (१ विद्यार्थी - अनिवार्य गणित)
                </span>
              </div>
              <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                <div style={{ width: "1.2%", height: "100%", background: "#ef4444", borderRadius: "99px" }} />
              </div>
            </div>
          </div>

          {/* Subject Mastery Snapshot */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                बलियो विषय: <strong style={{ color: "#34d399" }}>कम्प्युटर विज्ञान (३.८४)</strong> · सुधार चाहिने:{" "}
                <strong style={{ color: "#f87171" }}>अनिवार्य गणित (३.१०)</strong>
              </div>
            </div>
            <button
              onClick={() => {
                handleAskAi("SEE गणितमा कमजोर विद्यार्थीहरूको लागि विशेष कक्षा योजना बनाउनुहोस्");
              }}
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                color: "#a5b4fc",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "11.5px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Cpu size={13} />
              <span>AI उपचारात्मक योजना हेर्नुहोस्</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 4: 2-COLUMN GRID:
          LEFT: Bilingual AI Institutional Copilot (नेपालीमा सोध्नुहोस्)
          RIGHT: Nepal Notice Desk & Emergency Circulars
          ============================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "22px",
          marginBottom: "28px",
        }}
      >
        {/* BILINGUAL AI COPILOT */}
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: "rgba(6, 182, 212, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#06b6d4",
                }}
              >
                <Cpu size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  संस्थागत एआई सल्लाहकार (Bilingual AI Copilot)
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  नेपाली तथा अंग्रेजी भाषामा तत्काल व्यवस्थापकीय परामर्श
                </span>
              </div>
            </div>

            {/* Language Selector */}
            <div
              style={{
                display: "inline-flex",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "3px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={() => setAiLanguage("NEP")}
                style={{
                  background: aiLanguage === "NEP" ? "rgba(6, 182, 212, 0.25)" : "transparent",
                  border: aiLanguage === "NEP" ? "1px solid rgba(6, 182, 212, 0.4)" : "none",
                  color: aiLanguage === "NEP" ? "#67e8f9" : "var(--text-muted)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                नेपाली
              </button>
              <button
                onClick={() => setAiLanguage("ENG")}
                style={{
                  background: aiLanguage === "ENG" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                  border: aiLanguage === "ENG" ? "1px solid rgba(99, 102, 241, 0.4)" : "none",
                  color: aiLanguage === "ENG" ? "#a5b4fc" : "var(--text-muted)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                English
              </button>
            </div>
          </div>

          {/* Quick Prompts Chips */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "14px",
            }}
          >
            {[
              {
                label: "दशैं–तिहार बिदा सूचना बनाउनुहोस्",
                query: "दशैं–तिहार बिदा सम्बन्धी अभिभावक सूचना तयार गर्नुहोस्",
              },
              {
                label: "SEE गणित उपचारात्मक योजना",
                query: "SEE गणितमा कमजोर विद्यार्थीहरूको लागि विशेष कक्षा योजना बनाउनुहोस्",
              },
              {
                label: "बक्यौता असुली रणनीति",
                query: "शुल्क संकलन र बक्यौता उठाउने रणनीति बनाउनुहोस्",
              },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleAskAi(chip.query)}
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#cbd5e1",
                  borderRadius: "20px",
                  padding: "5px 12px",
                  fontSize: "11.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat History Box */}
          <div
            style={{
              flex: 1,
              minHeight: "220px",
              maxHeight: "310px",
              overflowY: "auto",
              background: "rgba(11, 15, 25, 0.7)",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              marginBottom: "14px",
            }}
          >
            {aiConversation.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)"
                      : "rgba(23, 32, 51, 0.9)",
                  border:
                    msg.role === "user"
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "12px 16px",
                  borderRadius:
                    msg.role === "user"
                      ? "14px 14px 2px 14px"
                      : "14px 14px 14px 2px",
                  color: "#ffffff",
                  fontSize: "13px",
                  lineHeight: 1.55,
                  whiteSpace: "pre-line",
                }}
              >
                {aiLanguage === "NEP" ? msg.textNep : msg.textEng}
              </div>
            ))}

            {aiGenerating && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "rgba(23, 32, 51, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  color: "#67e8f9",
                  fontSize: "12.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <RefreshCw size={13} className="spin-icon" />
                <span>एआई विश्लेषण गर्दैछ...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAi();
            }}
            style={{ display: "flex", gap: "8px" }}
          >
            <input
              type="text"
              placeholder={
                aiLanguage === "NEP"
                  ? "विद्यालय सम्बन्धी प्रश्न नेपालीमा सोध्नुहोस्..."
                  : "Ask AI copilot regarding academics, fees, or routine..."
              }
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="input-field"
              style={{ flex: 1, height: "42px", fontSize: "13px" }}
            />
            <button
              type="submit"
              disabled={aiGenerating || !aiInput.trim()}
              className="btn btn-primary"
              style={{
                height: "42px",
                padding: "0 18px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Send size={15} />
              <span>सोध्नुहोस्</span>
            </button>
          </form>
        </div>

        {/* NEPAL NOTICE & EMERGENCY BROADCAST DESK */}
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: "rgba(244, 63, 94, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f43f5e",
                }}
              >
                <Bell size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  सूचना तथा आकस्मिक डेस्क (Notice Board)
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  स्प्यारो एसएमएस (Sparrow SMS) र भाइबर मार्फत तत्काल प्रशारण
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowNoticeModal(true)}
              className="btn btn-secondary"
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>+ नयाँ सूचना</span>
            </button>
          </div>

          {/* Notices List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            {notices.map((notice) => (
              <div
                key={notice.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.025)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background:
                        notice.tagType === "danger"
                          ? "rgba(239, 68, 68, 0.2)"
                          : notice.tagType === "warning"
                          ? "rgba(245, 158, 11, 0.2)"
                          : "rgba(16, 185, 129, 0.2)",
                      color:
                        notice.tagType === "danger"
                          ? "#f87171"
                          : notice.tagType === "warning"
                          ? "#fbbf24"
                          : "#34d399",
                    }}
                  >
                    {notice.tag}
                  </span>

                  <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    {notice.dateBs}
                  </span>
                </div>

                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff", lineHeight: 1.4 }}>
                  {notice.title}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "4px",
                    fontSize: "11.5px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>लक्षित वर्ग: {notice.target}</span>
                  {notice.smsSent && (
                    <span
                      style={{
                        color: "#34d399",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>SMS डेलिभरी सफल</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 5: ENTERPRISE MODULE DIRECTORY (ORGANIZED & SEARCHABLE)
          ============================================================ */}
      <section style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.01em",
              }}
            >
              संस्थागत मोड्युल निर्देशिका (Enterprise Operations Catalog)
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
              विद्यार्थी, प्राध्यापक, लेखा, यातायात तथा एआई प्रणालीको प्रत्यक्ष नियन्त्रण
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: "सबै मोड्युलहरू (All)" },
              { id: "ACADEMICS", label: "शैक्षिक (Academics)" },
              { id: "HR_STAFF", label: "कर्मचारी तथा तलब (HR & Payroll)" },
              { id: "FINANCE_OPS", label: "आर्थिक तथा संचालन (Finance)" },
              { id: "AI_ADMIN", label: "एआई तथा सुरक्षा (AI & IAM)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "7px 13px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border:
                    selectedCategory === cat.id
                      ? "1px solid var(--accent-indigo)"
                      : "1px solid var(--border-default)",
                  background:
                    selectedCategory === cat.id
                      ? "rgba(99, 102, 241, 0.15)"
                      : "var(--bg-surface)",
                  color:
                    selectedCategory === cat.id
                      ? "var(--accent-indigo-light)"
                      : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="मोड्युल खोज्नुहोस्..."
              value={moduleSearch}
              onChange={(e) => setModuleSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Modules Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="card"
                onClick={() => navigate(mod.path)}
                style={{
                  padding: "20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  transition:
                    "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid var(--border-default)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: mod.color,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <ArrowUpRight size={17} style={{ color: "var(--text-muted)" }} />
                  </div>

                  <h4
                    style={{
                      margin: "0 0 6px",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {mod.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12.5px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {mod.description}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "var(--accent-cyan)",
                      textTransform: "uppercase",
                    }}
                  >
                    सक्रिय प्रणाली
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                    }}
                  >
                    खोल्नुहोस् →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          MODAL 1: CAMPUS MASTER BELL ROUTINE
          ============================================================ */}
      {showRoutineModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "680px",
              padding: "26px",
              background: "#0d1322",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={20} style={{ color: "#06b6d4" }} />
                <h3 style={{ margin: 0, fontSize: "18px", color: "#ffffff" }}>
                  दैनिक घण्टी तालिका (Daily Bell Schedule - Kathmandu Campus)
                </h3>
              </div>
              <button
                onClick={() => setShowRoutineModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { time: "09:45 AM – 10:00 AM", period: "Morning Assembly", subject: "राष्ट्रिय गान, प्रार्थना तथा दैनिक समाचार", active: false },
                { time: "10:00 AM – 10:45 AM", period: "Period 1", subject: "कक्षा १०: अनिवार्य नेपाली / कक्षा १२: भौतिक विज्ञान", active: false },
                { time: "10:45 AM – 11:30 AM", period: "Period 2", subject: "कक्षा १०: अंग्रेजी / कक्षा १२: रसायन शास्त्र", active: false },
                { time: "11:30 AM – 12:15 PM", period: "Period 3", subject: "कक्षा १०: विज्ञान तथा प्रविधि / कक्षा १२: ऐच्छिक गणित", active: false },
                { time: "12:15 PM – 01:00 PM", period: "Period 4 (वर्तमान)", subject: "कक्षा १०: अनिवार्य गणित / कक्षा १२: कम्प्युटर विज्ञान", active: true },
                { time: "01:00 PM – 01:40 PM", period: "Tiffin / Lunch Break", subject: "विद्यार्थी तथा शिक्षक खाजा समय (४० मिनेट)", active: false },
                { time: "01:40 PM – 02:25 PM", period: "Period 5", subject: "कक्षा १०: सामाजिक अध्ययन / कक्षा १२: लेखाविधि (Accounting)", active: false },
                { time: "02:25 PM – 03:10 PM", period: "Period 6", subject: "कक्षा १०: ऐच्छिक गणित / कक्षा १२: अर्थशास्त्र", active: false },
                { time: "03:10 PM – 03:50 PM", period: "Period 7", subject: "पुस्तकालय / अतिरिक्त क्रियाकलाप / खेलकुद", active: false },
              ].map((slot, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: slot.active
                      ? "rgba(6, 182, 212, 0.15)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: slot.active
                      ? "1px solid rgba(6, 182, 212, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: slot.active ? "#67e8f9" : "var(--text-muted)",
                      }}
                    >
                      {slot.time} · {slot.period}
                    </span>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff", marginTop: "2px" }}>
                      {slot.subject}
                    </div>
                  </div>
                  {slot.active && (
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "#06b6d4",
                        color: "#07090e",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      हाल सञ्चालनमा
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowRoutineModal(false)}
                className="btn btn-secondary"
                style={{ padding: "8px 20px" }}
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: ESEWA / KHALTI / FONEPAY PAYMENT TERMINAL
          ============================================================ */}
      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "540px",
              padding: "26px",
              background: "#0e1526",
              border: "1px solid rgba(16, 185, 129, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <QrCode size={20} style={{ color: "#10b981" }} />
                <h3 style={{ margin: 0, fontSize: "18px", color: "#ffffff" }}>
                  नेपाल डिजिटल शुल्क संकलन काउन्टर
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Gateway Tabs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              {[
                { id: "FONEPAY", label: "Fonepay QR", color: "#ef4444" },
                { id: "ESEWA", label: "eSewa Direct", color: "#10b981" },
                { id: "KHALTI", label: "Khalti Wallet", color: "#a855f7" },
              ].map((gw) => (
                <button
                  key={gw.id}
                  onClick={() => {
                    setPayGateway(gw.id);
                    setPayStatus("IDLE");
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border:
                      payGateway === gw.id
                        ? `2px solid ${gw.color}`
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    background:
                      payGateway === gw.id
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(255, 255, 255, 0.02)",
                    color: payGateway === gw.id ? gw.color : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    cursor: "pointer",
                  }}
                >
                  {gw.label}
                </button>
              ))}
            </div>

            {/* Student & Fee details */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: "14px",
                borderRadius: "10px",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>विद्यार्थी नाम:</span>
                <strong style={{ fontSize: "13px", color: "#ffffff" }}>{payStudent}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>भुक्तानी शीर्षक:</span>
                <span style={{ fontSize: "13px", color: "#ffffff" }}>द्वितीय त्रैमासिक ट्युसन तथा परीक्षा शुल्क</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>जम्मा रकम (NPR):</span>
                <strong style={{ fontSize: "16px", color: "#34d399" }}>रू {payAmount}</strong>
              </div>
            </div>

            {/* Gateway Interactive Body */}
            {payStatus === "IDLE" && (
              <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                {payGateway === "FONEPAY" && (
                  <div>
                    {/* Simulated QR Box */}
                    <div
                      style={{
                        width: "180px",
                        height: "180px",
                        margin: "0 auto 14px",
                        background: "#ffffff",
                        borderRadius: "14px",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      }}
                    >
                      <QrCode size={130} color="#1e293b" />
                      <span style={{ fontSize: "10px", color: "#ef4444", fontWeight: 800 }}>
                        FONEPAY NEPAL QR
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
                      कुनै पनि नेपाली बैंकको मोबाइल बैंकिङ वा eSewa/Khalti बाट स्क्यान गर्नुहोस्
                    </p>
                  </div>
                )}

                {payGateway === "ESEWA" && (
                  <div style={{ padding: "10px" }}>
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <Smartphone size={24} />
                    </div>
                    <h4 style={{ margin: "0 0 6px", color: "#ffffff" }}>eSewa Direct Checkout</h4>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)" }}>
                      EduNexus Academy Verified Merchant Account #601248921
                    </p>
                  </div>
                )}

                {payGateway === "KHALTI" && (
                  <div style={{ padding: "10px" }}>
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "rgba(168, 85, 247, 0.2)",
                        color: "#a855f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <Smartphone size={24} />
                    </div>
                    <h4 style={{ margin: "0 0 6px", color: "#ffffff" }}>Khalti Smart Pay</h4>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)" }}>
                      तत्काल १०% क्यासब्याक वा पोइन्ट्स उपलब्ध
                    </p>
                  </div>
                )}

                <button
                  onClick={handleProcessPayment}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>भुक्तानी पुष्टि गर्नुहोस् (Simulate Receive)</span>
                </button>
              </div>
            )}

            {payStatus === "PROCESSING" && (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <RefreshCw size={36} className="spin-icon" style={{ color: "#10b981", margin: "0 auto 14px" }} />
                <h4 style={{ margin: "0 0 6px", color: "#ffffff" }}>नेपाल राष्ट्र बैंक इन्टरचेञ्ज प्रमाणीकरण हुँदैछ...</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
                  Connecting with {payGateway} Gateway Server
                </p>
              </div>
            )}

            {payStatus === "SUCCESS" && (
              <div style={{ textAlign: "center", padding: "15px 0" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <ShieldCheck size={32} />
                </div>
                <h3 style={{ margin: "0 0 4px", color: "#34d399" }}>भुक्तानी सफल भयो!</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  रसिद नं: <strong>{receiptNumber}</strong>
                </span>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: "12px",
                    borderRadius: "8px",
                    marginTop: "16px",
                    textAlign: "left",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>कर दर्ता (PAN):</span>
                    <strong>६०१२४८९२१</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>प्राप्त रकम:</span>
                    <strong>रू {payAmount}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>गेटवे ट्रान्ज्याक्सन:</span>
                    <strong>{payGateway}-TXN-8291480</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "10px" }}
                  >
                    बन्द गर्नुहोस्
                  </button>
                  <button
                    onClick={() => {
                      alert(`रसिद ${receiptNumber} पिडिएफ तयार भयो!`);
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    <Printer size={15} />
                    <span>रसिद छाप्नुहोस्</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 3: POST URGENT NOTICE & SMS BROADCAST
          ============================================================ */}
      {showNoticeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "26px",
              background: "#0d1322",
              border: "1px solid rgba(99, 102, 241, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={20} style={{ color: "#818cf8" }} />
                <h3 style={{ margin: 0, fontSize: "18px", color: "#ffffff" }}>
                  नयाँ संस्थागत सूचना तथा एसएमएस जारी
                </h3>
              </div>
              <button
                onClick={() => setShowNoticeModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostNotice} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", marginBottom: "6px", color: "var(--text-secondary)" }}>
                  सूचनाको शीर्षक (Notice Heading):
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: भारी वर्षाका कारण भोलिको कक्षा अनलाइन हुने सम्बन्धमा..."
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="input-field"
                  style={{ width: "100%", height: "40px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", marginBottom: "6px", color: "var(--text-secondary)" }}>
                    प्राथमिकता (Priority):
                  </label>
                  <select
                    value={newNoticeTag}
                    onChange={(e) => setNewNoticeTag(e.target.value)}
                    className="input-field"
                    style={{ width: "100%", height: "40px", fontSize: "13px" }}
                  >
                    <option value="URGENT">🔴 अत्यावश्यक (Emergency / Weather)</option>
                    <option value="ACADEMIC">🟡 परीक्षा / शैक्षिक (CDC Exam)</option>
                    <option value="HOLIDAY">🟢 चाडपर्व / सार्वजनिक बिदा</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", marginBottom: "6px", color: "var(--text-secondary)" }}>
                    लक्षित वर्ग (Audience):
                  </label>
                  <select
                    value={newNoticeTarget}
                    onChange={(e) => setNewNoticeTarget(e.target.value)}
                    className="input-field"
                    style={{ width: "100%", height: "40px", fontSize: "13px" }}
                  >
                    <option value="ALL_PARENTS">सम्पूर्ण अभिभावक (८९२ जना)</option>
                    <option value="STUDENTS_10_12">कक्षा १० र १२ का विद्यार्थी</option>
                    <option value="FACULTY">शिक्षक तथा कर्मचारी मात्र</option>
                  </select>
                </div>
              </div>

              {/* SMS Broadcast Checkbox */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id="sms_checkbox"
                  checked={sendSmsBroadcast}
                  onChange={(e) => setSendSmsBroadcast(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label
                  htmlFor="sms_checkbox"
                  style={{ fontSize: "12.5px", color: "#ffffff", cursor: "pointer", fontWeight: 600 }}
                >
                  स्प्यारो एसएमएस (Sparrow SMS / Viber) मार्फत तत्काल मोबाइल सन्देश पठाउनुहोस्
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 18px" }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "8px 22px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Send size={14} />
                  <span>प्रशारण गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPONENT STYLES */}
      <style>{`
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideInToast {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </AppLayout>
  );
}
