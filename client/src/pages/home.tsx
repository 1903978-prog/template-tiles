import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  Download,
  Upload,
  Check,
  LayoutGrid,
  ClipboardPaste,
  FolderOpen,
  FolderPlus,
  Inbox,
  GripVertical,
  X,
  FileText,
} from "lucide-react";

interface Folder {
  id: string;
  name: string;
}

interface TemplateTile {
  id: string;
  title: string;
  body: string;
  folderId: string | null;
}

interface AppData {
  folders: Folder[];
  tiles: TemplateTile[];
}

const STORAGE_KEY = "template-tiles-data";
const UNCATEGORIZED_ID = "__uncategorized__";

const DEFAULT_FOLDERS: Folder[] = [
  { id: "folder-emails", name: "Emails" },
  { id: "folder-finance", name: "GPT" },
  { id: "folder-internal", name: "PROPOSALS" },
];

const DEFAULT_TILES: TemplateTile[] = [
  {
    id: "1",
    title: "COLD 1",
    body: "Hi [Name],\n\nAcross PE-backed B2B platforms, we consistently observe three structural sources of unrealized value:\n\n~2 EBITDA points lost through pricing leakage and architecture gaps\n\n15\u201325% of commercial resources structurally misallocated\n\n10\u201315% incremental EBITDA potential from underdeveloped cross-sell and hunting\n\nIndividually manageable \u2014 combined, often a material value creation gap within the holding period.\n\nWe partner with funds such as Bain Capital, Carlyle and CVC to close these gaps alongside portfolio leadership teams.\n\nIf relevant, happy to exchange perspectives for 15 minutes.\n\nBest regards,\nLivio",
    folderId: "folder-emails",
  },
  {
    id: "2",
    title: "PRE LM CSI",
    body: "Dear Alessandro,\n\nCongratulations, and thank you for the time and effort you invested throughout our assessment process.\n\nWe are pleased to confirm that you successfully passed the analytical tests as well as the case discussion with our manager. As a result, we would like to invite you to proceed to the final interview stage with one of our partners, which will include a case study discussion.\n\nAt Eendigo, we select only a very small fraction of applicants (approximately 0.1% of applications), so reaching this stage is already a meaningful achievement.\n\nJoining Eendigo offers a distinctive opportunity to:\n\u2022 Work on high-impact projects with global companies and leading Private Equity firms, interacting directly with CEOs and investors.\n\u2022 Build a steep learning curve through hands-on project work and our structured Commercial Excellence Graduation program.\n\u2022 Operate in a flexible, international environment, with the freedom to work from different locations while collaborating with clients worldwide.\n\u2022 Contribute from day one within a flat hierarchy where merit and ideas matter.\n\u2022 Collaborate with an exceptional team of consultants with backgrounds in leading strategy consultancies and global corporations.\n\nAs a next step, we need to schedule a 1-hour partner interview including a case discussion.\nCould you please share 2\u20133 time slots over the next few days that could work for you?\n\nKindly share your university graduation bachelor and master showing the grades as well as the last pay slip and a pay slip with the bonus if any.\nWe look forward to continuing the conversation.\n\nBest regards,\nBrigitte\n\n\n_____________________________________________________\nBrigitte Decker\n\nEendigo LLC\nEmail: bdecker@eendigo.com\nWebsite: eendigo.com\n\n\nSee how we can support your success \u2013 watch a short video here\nJoin the 30,000 readers of our bestseller on accelerating growth with via channel strategies here\n\nThe content of this email is confidential and intended solely for the recipient specified and may contain confidential, trade secret and/or privileged material. Unauthorized sharing of any part of this message with third parties is prohibited without the sender's written consent. If you are not the intended recipient of this information, do not review or share this information, and please contact the sender, destroy all printed copies, and delete the material from all computers. Eendigo may collect and process your personal data, including retaining and monitoring this communication.",
    folderId: "folder-emails",
  },
  {
    id: "3",
    title: "HIRE 1",
    body: "Dear\n\nMany thanks for your interest in joining Eendigo.\n\nEendigo specializes in delivering world-class management consulting services globally, focusing on commercial excellence, strategy and all the drivers that allow organizations to get to the next level. We support the most demanding and leading Private Equity funds such as Bain Capital, Carlyle, Cinven or Advent to name a few. We are also the privileged partners of the largest Wealth Funds such as the Abu Dhabi ADQ or PIF in KSA with combined assets exceeding 2 trillion dollars.\n\nOur team is driven by a shared passion for innovation, collaboration, and creating impactful solutions for our clients. We are a truly global company speaking 12 languages; our partners gained experience in leading corporations and institutions such as the White House, Nasa, McKinsey, Goldman Sachs and major SP500 corporations. Our innovation has been published on the Harvard Business Review and by the leading Business Publisher, \"Springer for Professional\". We are also the founding member of the Commercial Excellence Institute and lead the creation of the Gold Standards together with Ivy League faculty and key executives from Apple and Amazon. We have conducted projects in over 20 countries delivering over $10b in incremental EV for our investors. Our promise to you is that your learning curve will be as steep as it gets working side by side with the sharpest minds, interacting weekly with the largest shareholders and CEOS directly. This is a unique opportunity isn't? An experience with us offers more than what you'd gain from an MBA\u2014it empowers you to unlock your full potential more effectively and rapidly than any other firm\n\nThis is a unique opportunity isn't? An experience with us offers more than what you'd gain from an MBA\u2014it empowers you to unlock your full potential more effectively and rapidly than any other firm\n\nWe invite you to learn more about the benefits of joining Eendigo by watching this brief video and to discover what we have in common with the best coaches here.\n\nWe seek ambitious professionals who are at the early stages of their careers and possess the skills and determination to effect enduring change for both our clients and our company. If you have one to a few years of experience in consulting or analyst positions and aspire to transition into a prestigious management consultancy that collaborates with top Private Equity Fund managers worldwide, then this opportunity is for you.\n\nAs a member of our team, you will work alongside 3 to 5 consultants, pooling your expertise to foster lasting improvements in client performance and help them achieve their most strategic objectives.\n\nIf this is in line with your career goals, we propose to kick off the recruitment steps together.\nYou will receive shortly further instructions on how to process and..don't forget to follow us on Linkedin to be informed of all news and job opportunities.\n\nWe look forward to our next meeting and wish you the best of luck with the rest of the process.\n\nBest\nEendigo",
    folderId: "folder-emails",
  },
  {
    id: "4",
    title: "CSI",
    body: "_______________________________________\n\ud83d\udd39 STANDARD INTERVIEW EVALUATION PROMPT (AUDIO)\nYou are evaluating a candidate interview based solely on the uploaded audio.\nStep 1 \u2013 Rate the 8 Personality & Performance Dimensions\nRate the candidate on each of the following dimensions, using a 1\u201310 scale (decimals allowed, one decimal max):\n1.\tCognitive Discipline\n2.\tAmbiguity Response\n3.\tEgo Separation\n4.\tEmotional Regulation\n5.\tQuiet Authority\n6.\tInstrumental Empathy\n7.\tInternal Standards\n8.\tControlled Ambition\nOutput only a table with:\n\u2022\tDimension\n\u2022\tScore (1\u201310)\nUse the same interpretation standards across all candidates (top-tier consulting / PE benchmark).\n________________________________________\nStep 2 \u2013 Critical Threshold Check\nIdentify the scores for:\n\u2022\tStep 2 dimension: Ambiguity Response\n\u2022\tStep 3 dimension: Quiet Authority\nApply this rule strictly:\n\u2022\tIf either score is below 7.0, flag the candidate as NOT READY for senior consulting responsibility.\nState clearly:\n\u2022\tPass / Fail\n\u2022\tWhich dimension(s) failed, if any\n________________________________________\nStep 3 \u2013 Final Hiring Tier Classification\nBased on the full pattern of scores and the threshold rule above, classify the candidate into one and only one tier:\n\u2022\tTop-Tier Consultant Personality\no\tConsistently \u22658\no\tStrong authority, structure, emotional control\n\u2022\tStrong Hire\no\tMostly \u22657\no\tNo critical weaknesses\n\u2022\tRisky Buy\no\tMixed scores, some <7\no\tCoaching required, execution risk\n\u2022\tFragile Profile\no\tMultiple <6\no\tNot suitable for high-pressure consulting roles\nOutput:\n\u2022\tFinal Tier\n\u2022\tOne-line justification (max 20 words)\n________________________________________\nOutput Format (Strict)\n1.\tTable \u2013 8 Dimensions with Scores\n2.\tThreshold Check Result (Pass / Fail)\n3.\tFinal Tier + One-Line Rationale\nDo not add explanations, coaching advice, or commentary beyond what is requested.\n________________________________________\n\nYou are acting as a Senior Partner at a top-tier management consultancy (McKinsey, BCG, Bain), with deep expertise in Commercial Excellence, Pricing, Sales & Marketing transformation, Private Equity value creation, and operator-led transformation programs.\nYour task is to evaluate the following interview using PE-grade execution standards, MBB-compatible rigor, and EENDIGO hiring calibration.\nThis is NOT a generic HR assessment. Do not try to give an assessment on topics that cannot be assessed, just say \"lack of evidence\" eg. If I submit a script you cannot judge the English accent.\nThis is a final consulting hiring committee decision.\nAssume:\n\u2022\tImmediate client exposure\n\u2022\tOperator-heavy, ambiguous environments\n\u2022\tLimited coaching bandwidth\n\u2022\tZero tolerance for credibility, authority, or ownership failures\n________________________________________\nINPUTS\nCompany: EENDIGO \u2014 Commercial Excellence Consulting Firm\nInterview material:\n\u2022\tAudio file (if available; transcribe first) or full transcript\nCandidate background (if available):\n\u2022\tCV summary (if attached)\nRole(s) under consideration:\n\u2022\tIntern / Associate / Senior Consultant / Manager\n\nExercise 1: You have dinner with an investor. He wants you to open a new company on January 1st selling oranges in Italy serving only the Italian market. He asks you a simple question: what is the revenue the company can make in year 1?\n\nExercise 5: Why metro stations should have a bigger exit than entry?\n\nExercise 8: You have a bank account in the US with $500k it pays 3% annual interest on monthly basis. You cannot reinvest the interests in the US. You can transfer the interests to your account in the UK which pays 3% yearly. The cost of each transfer is 10usd. How often should you transfer the interests proceeds to maximize your net income?\n\nExercise 9: You have a holiday home in the mountains. You put some meat in the freezer and you come back 6 months later. Before eating the meat you want to be sure to know if there were electric power cuts or not. What is the simplest method you have to ensure this, so when you come back you can be 100% sure that the meat has remained frozen the whole time?\n\nExercise 10: How many calls are needed for 5 members to have bilateral calls\n\nExercise 11: Calculate the distance of these two poles\n\n________________________________________\nEVALUATION PRINCIPLES (MANDATORY)\n\u2022\tApply MBB logic first, then PE-grade recalibration\n\u2022\tJudge readiness, not potential\n\u2022\tIf evidence is missing \u2192 assume risk\n\u2022\t\"Trainable gaps\" are NOT acceptable above Intern level\n\u2022\tAverage performance = FAIL\n\u2022\tKeep output structure identical every time\n\u2022\tWrite as if this output alone determines the offer\n________________________________________\nPART 1 \u2014 PERSONALITY & EXECUTIVE SIGNAL ASSESSMENT (AUDIO-BASED)\nWrite first Name and overall score = (avg skill*2, avg character, avg firm knowledge)/4\nThen write recommendation: HIRE, Not HIRE, STRETCH and role\n\nFINAL RULE (ABSOLUTE)\nIf any hard gate fails, verdict MUST be NO HIRE (above Intern).\nDo NOT soften feedback.\nDo NOT hedge.\nDo NOT generalize.\n\nStart report with avg score on Skills, personality, understanding of eendigo\nFor any dimension where direct, observable evidence is not present in the provided materials, the evaluator MUST explicitly state \"lack of evidence\" and MUST NOT infer, assume, or score that dimension.\n\nWrite as if this output alone determines the offer decision.\nFinal assessment /strong hire-hire-consider-reject and the role proposed\nDo not ask me any question, don't tell me how you proceed. Create report immediately\nAt end of report add an excel file with all results in synthetic format: the 3 tables, their average score, the role proposed if any",
    folderId: "folder-finance",
  },
  {
    id: "5",
    title: "Reminder / nudge",
    body: "Hi [Name],\n\nJust a friendly reminder about [task/deadline/event]. The deadline is approaching on [date].\n\nIf you need any help or have questions, don't hesitate to reach out.\n\nThanks,\n[Your Name]",
    folderId: null,
  },
  {
    id: "6",
    title: "PROPOSAL EMAIL 1",
    body: "Team,\n\nHere's a quick update on [project/topic]:\n\nProgress:\n- [Update 1]\n- [Update 2]\n\nNext steps:\n- [Action item 1]\n- [Action item 2]\n\nPlease flag any blockers or concerns. Let's sync at our next standup.\n\nThanks,\n[Your Name]",
    folderId: "folder-internal",
  },
  {
    id: "mmqa34o1fqnf45",
    title: "FLIGHTS",
    body: "Role: You are a flight data analyst.\nTask: Perform a real-time Business Class flight search and provide a structured comparison table.\nInputs:\n\u2022\tOrigin: [Insert City/Airport, e.g., HKT]\n\u2022\tDestination: [Insert City/Airport, e.g., Paris]\n\u2022\tTravel Dates: [Insert Dates, e.g., Feb 26\u201328, 2026]\nMandatory Filters (Display ONLY these):\n1.\tSeating: Business Class only.\n2.\tDeparture (Origin): Must be after 08:29 AM.\n3.\tStopover Arrival: Must arrive at the layover airport before 11:59 PM local time.\n4.\tSafety Rating: Do NOT display any airline with a safety rating below 4.\n5. Report airport safety using all public data issued by governments and aviation authorities. Consider especially the US-Iran war, hence middle east should not be rated as safe\nTable Columns (Required):\n| Date | Airline | Dep. Origin | Arrv. Stopover (Local) | Dep. 2nd Leg (Local) | Stopover Duration | Real Flight Time | Total Trip Duration | Price (EUR) | Safety Rating | BC Quality | Flight Rating |\nFormatting Rules:\n\u2022\tSafety Rating: Display as a single digit (e.g., 7).\n\u2022\tBC Quality: Display as a single digit (e.g., 5, 4, or 3) without the word \"star\".\n\u2022\tPrices: Display as a plain number (e.g., 1850).\nScoring Logic (Flight Rating Column):\nStart at 0 and apply these cumulative adjustments:\n\u2022\t-0.5p if Departure from Origin is before 10:30 AM.\n\u2022\t-1.0p if Price is over \u20ac2,000.\n\u2022\t-1.0p if the 2nd Leg departs between 03:00 AM and 11:00 AM.\n\u2022\t-0.5p if the 2nd Leg departs any time after midnight (00:01+).\n\u2022\t+1.0p if BC Quality is 5.\n\u2022\t-0.5p if BC Quality is 3.\nConstraint: Do not make additional assumptions or add conversational fluff. Use real-time flight data tools to populate the table.",
    folderId: "folder-finance",
  },
  {
    id: "mmqa3hc8938pen",
    title: "CLAUDE SLIDE",
    body: "You are a senior strategy consultant (McKinsey / BCG level) preparing one executive PowerPoint slide using the Eendigo consulting template.\nYour task is to produce structured slide content ready to paste into PowerPoint.\nDo NOT write explanations.\nDo NOT write paragraphs.\nOutput only the slide structure and text.\nThe slide must look like a top-tier consulting slide.\n\n1. EENDIGO TEMPLATE \u2014 STRICT RULES\nTop-left label: TRACKER\nStyle: Arial, 7pt, #535353, NOT bold, all capital, Left aligned\nImportant: NO horizontal line under the tracker label.\n\nSlide Title: Arial Bold, 22pt, Left aligned\nRules: Title must NEVER be teal, Title must NEVER use accent colors\n\nSection Headers: Arial Bold, 16pt, Color #1A6571\nBody text: Arial, 12\u201314pt, Color #535353\nFootnote: Arial, 7pt, Color #535353\nFooter right: Eendigo color #1A6571, Page number Color #535353\n\n2. Color Palette (STRICT)\nPage title: #1A6571\nPrimary text: #535353\nSecondary accents: #005B96, #5E7FB4, #4D836E, #765B52, #E4C895\nBorders: #16C3CF\n\n3. Layout Rules\n\u2022 3 structured blocks (preferred) or 4 blocks maximum\n\u2022 Boxes: Border color #16C3CF, 1pt, White background, 0.8cm spacing\n\n4. Bullet Writing Rules\nMaximum 6\u20138 words per bullet. No sentences.\n\n5. Consulting Logic (MANDATORY)\nPyramid principle. Title = key takeaway.\n\n6. STRICT NEGATIVE RULES\nDo NOT: change title color, use teal title, add horizontal lines under tracker, add colored backgrounds, invent new template elements\n\n7. Output Format\nTRACKER (light grey, small)\nSLIDE TITLE (insight headline)\nLAYOUT (description)\nBLOCK 1-3 (Header + Bullets)\nFOOTER LEFT: Notes and source\n\n8. Slide Topic\n[INSERT TOPIC HERE]\nAudience: PE operating partners / CEOs / board members",
    folderId: "folder-finance",
  },
  {
    id: "mmqa3t46xo9h2q",
    title: "ASSESS HIRE INTRO CALL",
    body: "CONSULTING SCREENING INTERVIEW EVALUATION PROMPT (FINAL DASHBOARD VERSION)\n\nYou are evaluating a candidate applying for an Intern or Business Analyst role at a consulting firm.\nThe candidate completed a 15-minute screening interview.\nYour task is to perform a rigorous, structured evaluation similar to a top consulting firm hiring process.\nThe goal is to determine whether the candidate should advance to a full case interview.\n\nCANDIDATE EVALUATION DASHBOARD (TOP KPIs)\nFinal Score: X%\nCapability Score: X%\nPersonality Score: X%\nEV Case Score: X / 100\nMECE Index: X%\nCSI (Cognitive Signal Index): X%\n\nFinal Score = 40% Capability Score + 20% Personality Score + 20% EV Case Score + 10% MECE Index + 10% CSI\n\nCapability Traits (1-5): Structured thinking, Analytical reasoning, Quantitative ability, Communication clarity, Learning velocity\nPersonality Traits (1-5): Intellectual curiosity, Ownership mindset, Professional maturity, Energy and drive, Coachability\n\nEV CASE BENCHMARK ANSWERS\nQ1 Revenue drivers: 4 parameters\nQ2 Sessions per day: 12\nQ3 Revenue per charger: \u20ac50,000\nQ4 Revenue for 2,000 chargers: \u20ac100M\n\nDECISION RULE\nFinal Score \u2265 75% \u2192 Advance to case interview\nFinal Score 65\u201374% \u2192 Borderline review\nFinal Score <65% \u2192 Reject\n\nFlag if any critical trait \u22642: Structured thinking, Analytical reasoning, Coachability\n\nRating Scale: 1 = Very weak, 2 = Weak, 3 = Acceptable, 4 = Strong, 5 = Exceptional\nAll scores must include evidence from the transcript.",
    folderId: "folder-finance",
  },
  {
    id: "mmqa4xphee2kqh",
    title: "PROPOSAL EMAIL OPT 2",
    body: "Based on the attached proposal and the structure and level of detail of the example below, write a professional, senior, consulting-style email to send to a client together with a formal proposal.\nThe email should:\n\u2022\tBe written in clear, structured business English\n\u2022\tBe addressed to multiple senior stakeholders\n\u2022\tFollow exactly this structure, using short section headers:\n1.\tIntroduction / proposal sharing\n2.\tScope and rationale\n3.\tEngagement options\n4.\tTimeline\n5.\tStart date\n6.\tTeam composition\n7.\tBudget\n8.\tOur approach / USP\n9.\tNext steps\n\u2022\tBe factual, precise, and non-salesy\n\u2022\tReference specific pages in the attached proposal where relevant\n\u2022\tReflect that the scope was refined based on client input\n\u2022\tPosition options clearly, without pushing one aggressively\n\u2022\tConvey confidence, flexibility, and execution focus\nStyle requirements:\n\u2022\tConsulting / PE-grade tone\n\u2022\tNo marketing language\n\u2022\tNo buzzwords\n\u2022\tClear, short paragraphs\n\u2022\tBullet points where appropriate\nEnd the email with:\n\u2022\tA polite request for confirmation on the preferred option\n\u2022\tAvailability for a follow-up discussion\n\u2022\tA confidentiality note in a short P.S.\nSign the email with:\n[Name]\n[Title]\n[Company]\n[Mobile / WhatsApp if relevant]\n\nUse the attached document to extract the following inputs:\n\u2022\tClient name\n\u2022\tBusiness unit\n\u2022\tTopic of the proposal\n\u2022\tKey priorities expressed by the client\n\u2022\tEngagement options (duration, focus)\n\u2022\tStart timing assumptions\n\u2022\tTeam composition\n\u2022\tBudget logic (fixed / variable / success fee)\n\u2022\tProposal page references\n\nUse the exact same structure, sequencing, and level of detail as the example email, but adapt wording and content to the inputs provided.",
    folderId: "folder-internal",
  },
  {
    id: "mmqbvgtrtijw8c",
    title: "INVOICE 1 UNPAID",
    body: "Dear All,\n\nI hope you are well.\n\nFollowing the past reminders, I would like to clarify the situation regarding the unpaid Invoice, which is currently past due.\n\nAs per our agreed contractual terms, the first payment is typically required within five days of contract signature and prior to the commencement of project activities. We noticed that no payment has yet been received.\nTo ensure continuity and alignment with the agreed framework, could you please confirm the reason for the delay and the expected payment date?\n\nWe kindly request that payment be processed by end of day tomorrow and that proof of payment be shared with us within the same timeframe. This will allow us to avoid the application of contractual late adjustments.\n\nShould there be any underlying issue or constraint on your side, we are fully available to arrange a call to address it promptly and reach a prompt resolution and avoid team delivery disruption.\n\nWe value the partnership and look forward to your prompt clarification.\nKind regards,\nBrigitte",
    folderId: "folder-emails",
  },
  {
    id: "mmqcv5jpzjr8ru",
    title: "CLAUDE 2",
    body: "You are a senior strategy consultant (McKinsey / BCG level) preparing one executive PowerPoint slide using the Eendigo consulting template.\nPptxGenJS \u2014 16:9\n\nHOW TO USE:\n1. Fill in SLIDE_TITLE and TRACKER\n2. Edit blocks[] with your headers + bullets\n3. Run: node eendigo_template.js\n4. Output: eendigo_slide.pptx\n\nPALETTE (DO NOT CHANGE)\nC_TRACKER = \"535353\"\nC_TITLE = \"1A6571\"\nC_HEADER = \"1A6571\"\nC_BORDER = \"16C3CF\"\nC_BODY = \"535353\"\nC_WHITE = \"FFFFFF\"\nC_SUBHEAD = \"16C3CF\"\nC_BGROW = \"F0F9FA\"\n\nTYPOGRAPHY (DO NOT CHANGE)\nTRACKER: Arial 7pt #535353 NOT bold\nTitle: Arial 20pt #1A6571 Bold\nHeaders: Arial 11pt #1A6571 Bold\nBullets: Arial 8.5pt #535353\nFooter: Arial 7pt #535353\nEendigo: Arial 7pt #1A6571 (footer right)\nPage num: Arial 7pt #535353 (footer right)\n\nSLIDE_TITLE = \"Insert your insight headline here \u2014 quantified takeaway for executives\"\n\nFORMAT A: 3-COLUMN WITH ROW BANDS (training / cert / prereq)\nFORMAT B: PLAIN 3-COLUMN BULLETS\n\nSet USE_ROW_BANDS = true or false to switch formats.\n\nBlocks support: header, training[], certificate[], prereq[] (Format A)\nOr: header, bullets[] (Format B)\n\nOptional INSIGHT_BAR for bottom callout.\nFooter left: \"Notes and source\"\nOutput: eendigo_slide.pptx\n\nRun with: node eendigo_template.js",
    folderId: "folder-finance",
  },
  {
    id: "mmuj79fhpfkey4",
    title: "GPT - Proposal deck",
    body: "",
    folderId: "folder-finance",
  },
];

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.folders && parsed.tiles) {
        return {
          folders: parsed.folders,
          tiles: parsed.tiles.map((t: any) => ({
            ...t,
            folderId: t.folderId ?? null,
          })),
        };
      }
      if (Array.isArray(parsed)) {
        return {
          folders: [],
          tiles: parsed.map((t: any) => ({ ...t, folderId: null })),
        };
      }
    }
  } catch {
    // ignore
  }
  return { folders: DEFAULT_FOLDERS, tiles: DEFAULT_TILES };
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function Home() {
  const [data, setData] = useState<AppData>(loadData);
  const [search, setSearch] = useState("");
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [editingTile, setEditingTile] = useState<TemplateTile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<"add" | "rename">("add");
  const [folderName, setFolderName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [deleteFolderConfirmId, setDeleteFolderConfirmId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [draggingTileId, setDraggingTileId] = useState<string | null>(null);
  const [previewTileId, setPreviewTileId] = useState<string | null>(null);
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [folderDropTargetId, setFolderDropTargetId] = useState<string | null>(null);
  const { toast } = useToast();
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { folders, tiles } = data;

  useEffect(() => {
    saveData(data);
  }, [data]);

  const setTiles = (updater: (prev: TemplateTile[]) => TemplateTile[]) => {
    setData((prev) => ({ ...prev, tiles: updater(prev.tiles) }));
  };

  const setFolders = (updater: (prev: Folder[]) => Folder[]) => {
    setData((prev) => ({ ...prev, folders: updater(prev.folders) }));
  };

  const isOnDashboard = openFolderId === null;
  const currentFolderName = openFolderId
    ? folders.find((f) => f.id === openFolderId)?.name || "Folder"
    : null;

  const visibleTiles = openFolderId
    ? tiles.filter((t) => t.folderId === openFolderId)
    : [];

  const filteredTiles = search.trim()
    ? (isOnDashboard ? tiles : visibleTiles).filter((tile) => {
        const q = search.toLowerCase();
        return tile.title.toLowerCase().includes(q) || tile.body.toLowerCase().includes(q);
      })
    : visibleTiles;

  const searchResultsGlobal = isOnDashboard && search.trim()
    ? tiles.filter((tile) => {
        const q = search.toLowerCase();
        return tile.title.toLowerCase().includes(q) || tile.body.toLowerCase().includes(q);
      })
    : null;

  const copyToClipboard = useCallback(
    async (tile: TemplateTile) => {
      try {
        await navigator.clipboard.writeText(tile.body);
        setCopiedId(tile.id);
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = setTimeout(() => setCopiedId(null), 1500);
        toast({
          title: "Copied!",
          description: `"${tile.title}" copied to clipboard`,
          duration: 2000,
        });
      } catch {
        toast({
          title: "Clipboard unavailable",
          description: "Your browser blocked clipboard access. Please select the text manually and press Ctrl+C / Cmd+C.",
          variant: "destructive",
          duration: 5000,
        });
      }
    },
    [toast]
  );

  const addTile = () => {
    const defaultFolder = openFolderId;
    const newTile: TemplateTile = {
      id: generateId(),
      title: "",
      body: "",
      folderId: defaultFolder,
    };
    setEditTitle("");
    setEditBody("");
    setEditFolderId(defaultFolder);
    setEditingTile(newTile);
    setEditDialogOpen(true);
  };

  const startEdit = (tile: TemplateTile) => {
    setEditTitle(tile.title);
    setEditBody(tile.body);
    setEditFolderId(tile.folderId);
    setEditingTile(tile);
    setEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (!editingTile) return;
    const updated: TemplateTile = {
      ...editingTile,
      title: editTitle.trim() || "Untitled",
      body: editBody,
      folderId: editFolderId,
    };
    setTiles((prev) => {
      const exists = prev.find((t) => t.id === updated.id);
      if (exists) {
        return prev.map((t) => (t.id === updated.id ? updated : t));
      }
      return [...prev, updated];
    });
    setEditDialogOpen(false);
    setEditingTile(null);
  };

  const deleteTile = (id: string) => {
    setTiles((prev) => prev.filter((t) => t.id !== id));
    if (previewTileId === id) setPreviewTileId(null);
  };

  const moveTileToFolder = (tileId: string, targetFolderId: string | null) => {
    setTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, folderId: targetFolderId } : t))
    );
    const folderLabel = targetFolderId
      ? folders.find((f) => f.id === targetFolderId)?.name || "folder"
      : "Uncategorized";
    toast({
      title: "Moved",
      description: `Template moved to ${folderLabel}`,
      duration: 1500,
    });
  };

  const openAddFolder = () => {
    setFolderDialogMode("add");
    setFolderName("");
    setRenamingFolderId(null);
    setFolderDialogOpen(true);
  };

  const openRenameFolder = (folder: Folder) => {
    setFolderDialogMode("rename");
    setFolderName(folder.name);
    setRenamingFolderId(folder.id);
    setFolderDialogOpen(true);
  };

  const saveFolder = () => {
    const name = folderName.trim();
    if (!name) return;
    if (folderDialogMode === "add") {
      setFolders((prev) => [...prev, { id: generateId(), name }]);
      toast({ title: "Folder created", description: `"${name}" added`, duration: 2000 });
    } else if (renamingFolderId) {
      setFolders((prev) =>
        prev.map((f) => (f.id === renamingFolderId ? { ...f, name } : f))
      );
      toast({ title: "Folder renamed", description: `Renamed to "${name}"`, duration: 2000 });
    }
    setFolderDialogOpen(false);
  };

  const deleteFolder = (folderId: string) => {
    setData((prev) => ({
      folders: prev.folders.filter((f) => f.id !== folderId),
      tiles: prev.tiles.map((t) =>
        t.folderId === folderId ? { ...t, folderId: null } : t
      ),
    }));
    if (openFolderId === folderId) setOpenFolderId(null);
    setDeleteFolderConfirmId(null);
    toast({ title: "Folder deleted", description: "Templates moved to Uncategorized", duration: 2000 });
  };

  const exportTemplates = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-tiles.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: `${tiles.length} templates and ${folders.length} folders exported`,
      duration: 2000,
    });
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      const validateTiles = (arr: any[]) =>
        arr.every((t: any) => typeof t.title === "string" && typeof t.body === "string");
      const validateFolders = (arr: any[]) =>
        arr.every((f: any) => typeof f.id === "string" && typeof f.name === "string");

      if (parsed.folders && parsed.tiles) {
        if (!Array.isArray(parsed.folders) || !Array.isArray(parsed.tiles))
          throw new Error("Invalid format");
        if (!validateFolders(parsed.folders) || !validateTiles(parsed.tiles))
          throw new Error("Invalid structure");
        setData({
          folders: parsed.folders,
          tiles: parsed.tiles.map((t: any) => ({
            id: t.id || generateId(),
            title: t.title,
            body: t.body,
            folderId: t.folderId ?? null,
          })),
        });
      } else if (Array.isArray(parsed)) {
        if (!validateTiles(parsed)) throw new Error("Invalid structure");
        setData((prev) => ({
          ...prev,
          tiles: parsed.map((t: any) => ({
            id: t.id || generateId(),
            title: t.title,
            body: t.body,
            folderId: t.folderId ?? null,
          })),
        }));
      } else {
        throw new Error("Invalid format");
      }
      setImportDialogOpen(false);
      setImportText("");
      setOpenFolderId(null);
      toast({ title: "Imported", description: "Templates imported successfully", duration: 2000 });
    } catch {
      toast({
        title: "Import failed",
        description: "Invalid JSON format. Expected {folders, tiles} or an array of templates.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleTileDragStart = (e: React.DragEvent, tileId: string) => {
    e.dataTransfer.setData("text/plain", tileId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTileId(tileId);
  };

  const handleTileDragEnd = () => {
    setDraggingTileId(null);
    setDragOverFolderId(null);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData("text/plain");
    if (tileId) {
      moveTileToFolder(tileId, targetFolderId);
    }
    setDragOverFolderId(null);
    setDraggingTileId(null);
  };

  const handleFolderCardDragStart = (e: React.DragEvent, folderId: string) => {
    e.dataTransfer.setData("application/folder-id", folderId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingFolderId(folderId);
  };

  const handleFolderCardDragEnd = () => {
    setDraggingFolderId(null);
    setFolderDropTargetId(null);
  };

  const handleFolderCardDragOver = (e: React.DragEvent, targetFolderId: string) => {
    if (!draggingFolderId || draggingFolderId === targetFolderId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setFolderDropTargetId(targetFolderId);
  };

  const handleFolderCardDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const sourceFolderId = e.dataTransfer.getData("application/folder-id");
    if (!sourceFolderId || sourceFolderId === targetFolderId) {
      setDraggingFolderId(null);
      setFolderDropTargetId(null);
      return;
    }
    setFolders((prev) => {
      const fromIndex = prev.findIndex((f) => f.id === sourceFolderId);
      const toIndex = prev.findIndex((f) => f.id === targetFolderId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
    setDraggingFolderId(null);
    setFolderDropTargetId(null);
  };

  const uncategorizedTiles = tiles.filter((t) => t.folderId === null);
  const uncategorizedCount = uncategorizedTiles.length;

  const previewTile = previewTileId ? tiles.find((t) => t.id === previewTileId) : null;

  const renderTileCard = (tile: TemplateTile) => {
    const isCopied = copiedId === tile.id;
    const isDragging = draggingTileId === tile.id;
    const isPreviewed = previewTileId === tile.id;

    return (
      <div
        key={tile.id}
        data-testid={`card-tile-${tile.id}`}
        draggable
        onDragStart={(e) => handleTileDragStart(e, tile.id)}
        onDragEnd={handleTileDragEnd}
        className={`group relative border rounded-md bg-card transition-all duration-200 cursor-pointer hover-elevate ${
          isPreviewed ? "ring-2 ring-primary border-primary/50" : isCopied ? "ring-2 ring-primary/50" : ""
        } ${isDragging ? "opacity-40" : ""}`}
        style={{ aspectRatio: "1 / 1" }}
        onClick={() => {
          copyToClipboard(tile);
          setPreviewTileId(tile.id);
        }}
      >
        <div className="absolute inset-0 flex flex-col p-4 overflow-hidden rounded-md">
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 cursor-grab" />
              <h3
                className="text-sm font-semibold leading-tight truncate"
                data-testid={`text-tile-title-${tile.id}`}
              >
                {tile.title || "Untitled"}
              </h3>
            </div>
            <div className="flex items-center gap-0.5 invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100 shrink-0">
              <button
                data-testid={`button-copy-tile-${tile.id}`}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(tile);
                }}
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                data-testid={`button-edit-${tile.id}`}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(tile);
                }}
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                data-testid={`button-delete-${tile.id}`}
                className="p-1 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTile(tile.id);
                }}
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isOnDashboard && tile.folderId && (
            <span className="text-[10px] text-muted-foreground/60 mb-1 truncate">
              {folders.find((f) => f.id === tile.folderId)?.name}
            </span>
          )}

          <p
            className="text-xs text-muted-foreground leading-relaxed flex-1 whitespace-pre-wrap overflow-hidden"
            data-testid={`text-tile-body-${tile.id}`}
          >
            {tile.body || "Empty template"}
          </p>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            {isCopied ? (
              <span className="text-xs font-medium text-primary flex items-center gap-1" data-testid={`text-copied-${tile.id}`}>
                <Check className="w-3 h-3" />
                Copied!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Click to preview
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16">
            <div className="flex items-center gap-2 shrink-0">
              <LayoutGrid className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                Template Tiles
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-testid="input-search"
                  type="search"
                  placeholder={isOnDashboard ? "Search all templates..." : `Search in ${currentFolderName}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 flex-wrap">
              <Button
                size="sm"
                variant="secondary"
                onClick={exportTemplates}
                data-testid="button-export"
              >
                <Download className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setImportDialogOpen(true)}
                data-testid="button-import"
              >
                <Upload className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground" data-testid="text-section-folders">Folders</h2>
          <Button size="sm" variant="secondary" onClick={openAddFolder} data-testid="button-add-folder">
            <FolderPlus className="w-4 h-4 mr-1" />
            New folder
          </Button>
        </div>

        <div
          className="grid gap-4 mb-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
          data-testid="grid-folders"
        >
              {folders.map((folder) => {
                const count = tiles.filter((t) => t.folderId === folder.id).length;
                const isConfirmingDelete = deleteFolderConfirmId === folder.id;
                const isDragOver = dragOverFolderId === folder.id;
                const isMoveTarget = previewTileId !== null && uncategorizedTiles.some((t) => t.id === previewTileId);
                const isActive = openFolderId === folder.id;

                const isFolderDragging = draggingFolderId === folder.id;
                const isFolderDropTarget = folderDropTargetId === folder.id;

                return (
                  <div
                    key={folder.id}
                    data-testid={`card-folder-${folder.id}`}
                    draggable
                    onDragStart={(e) => handleFolderCardDragStart(e, folder.id)}
                    onDragEnd={handleFolderCardDragEnd}
                    className={`group/folder relative border rounded-md cursor-pointer hover-elevate transition-all duration-200 ${
                      isFolderDragging
                        ? "opacity-40"
                        : isFolderDropTarget && draggingFolderId
                          ? "ring-2 ring-blue-400 border-blue-400 bg-blue-50 dark:bg-blue-950/30"
                          : isMoveTarget
                            ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 hover:border-green-400 dark:hover:border-green-600"
                            : isActive
                              ? "ring-2 ring-primary border-primary/50 bg-primary/5"
                              : isDragOver
                                ? "ring-2 ring-primary border-primary/50 bg-primary/5 bg-card"
                                : "bg-card"
                    }`}
                    style={{ aspectRatio: "4 / 3" }}
                    onClick={() => {
                      if (draggingFolderId) return;
                      if (isActive) {
                        setOpenFolderId(null);
                        setSearch("");
                        setPreviewTileId(null);
                      } else if (isMoveTarget && previewTileId) {
                        moveTileToFolder(previewTileId, folder.id);
                        setPreviewTileId(null);
                      } else {
                        setOpenFolderId(folder.id);
                        setPreviewTileId(null);
                        setSearch("");
                      }
                    }}
                    onDragOver={(e) => {
                      if (draggingFolderId) {
                        handleFolderCardDragOver(e, folder.id);
                      } else {
                        handleFolderDragOver(e, folder.id);
                      }
                    }}
                    onDragLeave={() => {
                      handleFolderDragLeave();
                      setFolderDropTargetId(null);
                    }}
                    onDrop={(e) => {
                      if (draggingFolderId) {
                        handleFolderCardDrop(e, folder.id);
                      } else {
                        handleFolderDrop(e, folder.id);
                      }
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-md">
                      <FolderOpen className={`w-10 h-10 mb-3 transition-colors ${
                        isMoveTarget ? "text-green-500 dark:text-green-400" : isDragOver ? "text-primary" : "text-muted-foreground/50"
                      }`} />
                      <h3 className="text-sm font-semibold text-center truncate w-full" data-testid={`text-folder-name-${folder.id}`}>
                        {folder.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isMoveTarget ? "Click to move here" : `${count} ${count === 1 ? "template" : "templates"}`}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 invisible group-hover/folder:visible flex items-center gap-0.5">
                      <button
                        data-testid={`button-rename-folder-${folder.id}`}
                        className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenameFolder(folder);
                        }}
                        title="Rename folder"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        data-testid={`button-delete-folder-${folder.id}`}
                        className="p-1 rounded-sm text-muted-foreground hover:text-destructive transition-colors bg-card/80 backdrop-blur"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isConfirmingDelete) {
                            deleteFolder(folder.id);
                          } else {
                            setDeleteFolderConfirmId(folder.id);
                            setTimeout(() => setDeleteFolderConfirmId(null), 3000);
                          }
                        }}
                        title={isConfirmingDelete ? "Click again to confirm" : "Delete folder"}
                      >
                        {isConfirmingDelete ? (
                          <Check className="w-3.5 h-3.5 text-destructive" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

        {isOnDashboard && !searchResultsGlobal && uncategorizedTiles.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2" data-testid="text-section-uncategorized">
                    <Inbox className="w-4 h-4 text-muted-foreground" />
                    Uncategorized
                    <span className="text-sm font-normal text-muted-foreground">({uncategorizedTiles.length})</span>
                  </h2>
                </div>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                  data-testid="grid-uncategorized"
                >
                  {uncategorizedTiles.map((tile) => {
                    const isCopied = copiedId === tile.id;
                    const isDragging = draggingTileId === tile.id;
                    const isPreviewed = previewTileId === tile.id;

                    return (
                      <div key={tile.id} className="flex flex-col gap-2">
                        <div
                          data-testid={`card-tile-${tile.id}`}
                          draggable
                          onDragStart={(e) => handleTileDragStart(e, tile.id)}
                          onDragEnd={handleTileDragEnd}
                          className={`group relative border rounded-md bg-card transition-all duration-200 cursor-pointer hover-elevate ${
                            isPreviewed ? "ring-2 ring-primary border-primary/50" : isCopied ? "ring-2 ring-primary/50" : ""
                          } ${isDragging ? "opacity-40" : ""}`}
                          style={{ aspectRatio: "1 / 1" }}
                          onClick={() => {
                            setPreviewTileId(previewTileId === tile.id ? null : tile.id);
                          }}
                        >
                          <div className="absolute inset-0 flex flex-col p-4 overflow-hidden rounded-md">
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 cursor-grab" />
                                <h3
                                  className="text-sm font-semibold leading-tight truncate"
                                  data-testid={`text-tile-title-${tile.id}`}
                                >
                                  {tile.title || "Untitled"}
                                </h3>
                              </div>
                              <div className="flex items-center gap-0.5 invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100 shrink-0">
                                <button
                                  data-testid={`button-copy-${tile.id}`}
                                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(tile);
                                  }}
                                  title="Copy"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  data-testid={`button-edit-${tile.id}`}
                                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(tile);
                                  }}
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  data-testid={`button-delete-${tile.id}`}
                                  className="p-1 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTile(tile.id);
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p
                              className="text-xs text-muted-foreground leading-relaxed flex-1 whitespace-pre-wrap overflow-hidden"
                              data-testid={`text-tile-body-${tile.id}`}
                            >
                              {tile.body || "Empty template"}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                              {isCopied ? (
                                <span className="text-xs font-medium text-primary flex items-center gap-1" data-testid={`text-copied-${tile.id}`}>
                                  <Check className="w-3 h-3" />
                                  Copied!
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                  <FolderPlus className="w-3 h-3" />
                                  Click to assign folder
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </>
            )}

        {isOnDashboard && searchResultsGlobal ? (
          <>
            {searchResultsGlobal.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="text-no-results">
                <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                <h2 className="text-base font-semibold text-foreground mb-4" data-testid="text-section-search-results">
                  Search results ({searchResultsGlobal.length})
                </h2>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                  data-testid="grid-tiles"
                >
                  {searchResultsGlobal.map(renderTileCard)}
                </div>
              </>
            )}
          </>
        ) : null}

        {!isOnDashboard ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2" data-testid="text-current-folder-label">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                {currentFolderName}
              </h2>
              <Button size="sm" onClick={addTile} data-testid="button-add-tile">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            {filteredTiles.length === 0 && search.trim() ? (
              <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="text-no-results">
                <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
              </div>
            ) : filteredTiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="text-empty-state">
                <FolderOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">This folder is empty</p>
                <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
                  Add a template or drag one here from another folder
                </p>
                <Button onClick={addTile} data-testid="button-add-tile-empty">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Template
                </Button>
              </div>
            ) : (
              <div
                className="grid gap-4 pb-20"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                data-testid="grid-tiles"
              >
                {filteredTiles.map(renderTileCard)}
              </div>
            )}
          </>
        ) : null}

        {isOnDashboard && !searchResultsGlobal && uncategorizedTiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="text-dashboard-empty">
            <ClipboardPaste className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Click a folder to view its templates</p>
          </div>
        )}

          </div>

          <div
            className="w-80 lg:w-96 shrink-0 hidden md:block sticky top-[73px] self-start border rounded-lg bg-card overflow-hidden flex flex-col"
            data-testid="panel-preview"
            style={{ height: "calc(100vh - 97px)" }}
          >
              {previewTile ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h3 className="text-sm font-semibold truncate flex-1 mr-2" data-testid="preview-title">
                      {previewTile.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        data-testid="button-preview-copy"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => copyToClipboard(previewTile)}
                        title="Copy to clipboard"
                      >
                        {copiedId === previewTile.id ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        data-testid="button-preview-edit"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => startEdit(previewTile)}
                        title="Edit template"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        data-testid="button-preview-close"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setPreviewTileId(null)}
                        title="Close preview"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {previewTile.folderId && (
                    <div className="px-4 py-2 border-b bg-muted/10">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        {folders.find((f) => f.id === previewTile.folderId)?.name || "Unknown folder"}
                      </span>
                    </div>
                  )}
                  {!previewTile.folderId && folders.length > 0 && (
                    <div className="px-4 py-2 border-b bg-muted/10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">Move to:</span>
                        {folders.map((f) => (
                          <button
                            key={f.id}
                            data-testid={`preview-move-to-${f.id}`}
                            className="flex items-center gap-1 px-2 py-0.5 rounded border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                            onClick={() => {
                              moveTileToFolder(previewTile.id, f.id);
                              setPreviewTileId(null);
                            }}
                          >
                            <FolderOpen className="w-3 h-3" />
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-4 flex-1 overflow-y-auto">
                    <p
                      className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
                      data-testid="preview-body"
                    >
                      {previewTile.body || "Empty template"}
                    </p>
                  </div>
                  <div className="px-4 py-3 border-t bg-muted/10">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => copyToClipboard(previewTile)}
                      data-testid="button-preview-copy-full"
                    >
                      {copiedId === previewTile.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 px-4 text-center" data-testid="preview-empty">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Select a template to preview</p>
                </div>
              )}
          </div>
        </div>
      </main>

      {draggingTileId && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-in slide-in-from-bottom-full duration-200"
          data-testid="drag-drop-bar"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Drop into a folder:</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {folders
                .filter((f) => f.id !== openFolderId)
                .map((folder) => {
                  const isDragOver = dragOverFolderId === folder.id;
                  return (
                    <div
                      key={folder.id}
                      data-testid={`drop-target-${folder.id}`}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-md border-2 border-dashed transition-all cursor-default ${
                        isDragOver
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                      onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                      onDragLeave={handleFolderDragLeave}
                      onDrop={(e) => handleFolderDrop(e, folder.id)}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                  );
                })}
              <div
                data-testid="drop-target-uncategorized"
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-md border-2 border-dashed transition-all cursor-default ${
                  dragOverFolderId === UNCATEGORIZED_ID
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
                onDragOver={(e) => handleFolderDragOver(e, UNCATEGORIZED_ID)}
                onDragLeave={handleFolderDragLeave}
                onDrop={(e) => handleFolderDrop(e, null)}
              >
                <Inbox className="w-4 h-4" />
                <span className="text-sm font-medium">Uncategorized</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setEditingTile(null);
          setEditTitle("");
          setEditBody("");
          setEditFolderId(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingTile && tiles.find((t) => t.id === editingTile.id)
                ? "Edit Template"
                : "New Template"}
            </DialogTitle>
            <DialogDescription>
              Add a title and paste or type your template text below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                data-testid="input-edit-title"
                placeholder="e.g. Follow-up email"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Folder</label>
              <Select
                value={editFolderId ?? UNCATEGORIZED_ID}
                onValueChange={(val) =>
                  setEditFolderId(val === UNCATEGORIZED_ID ? null : val)
                }
              >
                <SelectTrigger data-testid="select-folder">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCATEGORIZED_ID}>Uncategorized</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Template text</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setEditBody(text);
                      toast({ title: "Pasted from clipboard", duration: 1500 });
                    } catch {
                      toast({
                        title: "Paste failed",
                        description: "Use Ctrl+V / Cmd+V to paste instead",
                        variant: "destructive",
                        duration: 3000,
                      });
                    }
                  }}
                  data-testid="button-paste-helper"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 mr-1" />
                  Paste
                </Button>
              </div>
              <Textarea
                data-testid="input-edit-body"
                placeholder="Type or paste your template text here..."
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="min-h-[200px] resize-y font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button onClick={saveEdit} data-testid="button-save-edit">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={folderDialogOpen} onOpenChange={(open) => {
        setFolderDialogOpen(open);
        if (!open) {
          setFolderName("");
          setRenamingFolderId(null);
        }
      }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle data-testid="text-folder-dialog-title">
              {folderDialogMode === "add" ? "New Folder" : "Rename Folder"}
            </DialogTitle>
            <DialogDescription>
              {folderDialogMode === "add"
                ? "Create a new folder to organize your templates."
                : "Enter a new name for this folder."}
            </DialogDescription>
          </DialogHeader>
          <Input
            data-testid="input-folder-name"
            placeholder="e.g. Emails, Finance, HR..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && folderName.trim()) saveFolder();
            }}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setFolderDialogOpen(false)}
              data-testid="button-cancel-folder"
            >
              Cancel
            </Button>
            <Button
              onClick={saveFolder}
              disabled={!folderName.trim()}
              data-testid="button-save-folder"
            >
              {folderDialogMode === "add" ? "Create" : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-import-title">Import Templates</DialogTitle>
            <DialogDescription>
              Paste the JSON export below. This will replace all existing templates.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            data-testid="input-import-json"
            placeholder='{"folders": [...], "tiles": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="min-h-[200px] resize-y font-mono text-sm"
          />

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setImportDialogOpen(false);
                setImportText("");
              }}
              data-testid="button-cancel-import"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importText.trim()}
              data-testid="button-confirm-import"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
