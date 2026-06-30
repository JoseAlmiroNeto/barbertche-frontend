import { StyleSheet } from "react-native";

export const palette = {
  ink: "#100d0a",
  espresso: "#18120d",
  panel: "#21170f",
  panelSoft: "#2b2018",
  copper: "#c47a3a",
  gold: "#dfb464",
  cream: "#f4ead8",
  muted: "#b59f82",
  danger: "#e06c58",
  success: "#7ec28f",
  line: "rgba(223, 180, 100, 0.18)"
};

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.ink
  },
  appShell: {
    flex: 1,
    backgroundColor: palette.ink
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: palette.ink
  },
  loadingText: {
    color: palette.cream,
    fontSize: 15,
    fontWeight: "700"
  },
  appIcon: {
    minWidth: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 14
  },
  authHero: {
    flex: 1
  },
  authImage: {
    opacity: 0.62
  },
  authShade: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 42,
    paddingBottom: 28,
    backgroundColor: "rgba(7, 5, 4, 0.68)"
  },
  authBrandBlock: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    marginBottom: 18
  },
  brandMark: {
    width: 104,
    height: 104,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8, 6, 4, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(223, 180, 100, 0.30)",
    marginBottom: 14
  },
  brandMarkLogo: {
    width: 94,
    height: 94,
    borderRadius: 6
  },
  authRule: {
    width: 72,
    height: 2,
    marginBottom: 12,
    backgroundColor: palette.gold,
    opacity: 0.72
  },
  kicker: {
    color: palette.gold,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    fontWeight: "800"
  },
  authTitle: {
    color: palette.cream,
    fontFamily: "Georgia",
    fontSize: 42,
    lineHeight: 47,
    fontWeight: "700",
    textAlign: "center"
  },
  authText: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 330,
    textAlign: "center"
  },
  authCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "rgba(18, 13, 9, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(223, 180, 100, 0.30)",
    borderRadius: 8,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  authCardTitle: {
    color: palette.cream,
    fontSize: 16,
    fontFamily: "Georgia",
    fontWeight: "700"
  },
  authFieldGroup: {
    gap: 6
  },
  inputLabel: {
    color: palette.gold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "900"
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(223, 180, 100, 0.24)",
    color: palette.cream,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.055)"
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: palette.line
  },
  headerBrand: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  headerLogo: {
    width: 46,
    height: 46,
    borderRadius: 8
  },
  headerCopy: {
    flex: 1,
    minWidth: 0
  },
  headerTitle: {
    color: palette.cream,
    fontSize: 20,
    fontFamily: "Georgia",
    fontWeight: "700"
  },
  roleButton: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  roleButtonText: {
    color: palette.gold,
    fontWeight: "800"
  },
  heroCard: {
    backgroundColor: palette.panel,
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12
  },
  heroTitle: {
    color: palette.cream,
    fontSize: 27,
    lineHeight: 32,
    fontFamily: "Georgia",
    fontWeight: "700"
  },
  heroText: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22
  },
  primaryButton: {
    backgroundColor: palette.gold,
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  dangerButton: {
    backgroundColor: palette.danger
  },
  authSubmitButton: {
    minHeight: 52,
    marginTop: 2
  },
  primaryButtonDisabled: {
    opacity: 0.55
  },
  primaryButtonText: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 15
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.panelSoft
  },
  secondaryButtonFull: {
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.panelSoft
  },
  secondaryButtonText: {
    color: palette.gold,
    fontWeight: "800"
  },
  legalAcceptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 2
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255,255,255,0.045)",
    marginTop: 1
  },
  checkboxChecked: {
    backgroundColor: palette.gold,
    borderColor: palette.gold
  },
  checkboxMark: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 14
  },
  legalAcceptText: {
    flex: 1,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18
  },
  inlineLink: {
    color: palette.gold,
    fontWeight: "900"
  },
  legalVersion: {
    color: palette.gold,
    fontSize: 12,
    fontWeight: "900",
    marginTop: -6
  },
  legalSection: {
    gap: 6
  },
  legalSectionTitle: {
    color: palette.cream,
    fontSize: 15,
    fontWeight: "900"
  },  sectionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6
  },
  sectionText: {
    color: palette.cream,
    fontSize: 20,
    fontFamily: "Georgia",
    fontWeight: "700"
  },
  sectionAction: {
    color: palette.gold,
    fontWeight: "800"
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: palette.line
  },
  segment: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6
  },
  segmentActive: {
    backgroundColor: palette.copper
  },
  segmentText: {
    color: palette.muted,
    fontWeight: "800"
  },
  segmentTextActive: {
    color: palette.cream
  },
  chipRow: {
    gap: 10,
    paddingRight: 18
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.panel
  },
  chipActive: {
    backgroundColor: palette.gold
  },
  chipText: {
    color: palette.muted,
    fontWeight: "800"
  },
  chipTextActive: {
    color: palette.ink
  },
  selectButton: {
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: palette.panelSoft,
    borderWidth: 1,
    borderColor: palette.line
  },
  selectButtonText: {
    color: palette.cream,
    fontWeight: "900"
  },
  selectButtonHint: {
    color: palette.gold,
    fontWeight: "900"
  },
  selectMenu: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.panel
  },
  selectOption: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(223, 180, 100, 0.10)"
  },
  selectOptionActive: {
    backgroundColor: palette.gold
  },
  selectOptionText: {
    color: palette.muted,
    fontWeight: "800"
  },
  selectOptionTextActive: {
    color: palette.ink,
    fontWeight: "900"
  },
  selectFieldWrapper: {
    gap: 0
  },
  selectField: {
    minHeight: 52,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: palette.line
  },
  selectFieldOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: "rgba(223, 180, 100, 0.36)"
  },
  selectFieldText: {
    flex: 1,
    color: palette.cream,
    fontWeight: "900"
  },
  selectFieldPlaceholder: {
    color: palette.muted
  },
  selectFieldArrow: {
    color: palette.gold,
    fontWeight: "900",
    fontSize: 13
  },
  selectDropdown: {
    maxHeight: 220,
    overflow: "hidden",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "rgba(223, 180, 100, 0.36)"
  },
  selectDropdownOption: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(223, 180, 100, 0.10)"
  },
  selectDropdownOptionActive: {
    backgroundColor: palette.gold
  },
  selectDropdownOptionText: {
    color: palette.muted,
    fontWeight: "800"
  },
  selectDropdownOptionTextActive: {
    color: palette.ink,
    fontWeight: "900"
  },
  dateStrip: {
    gap: 10,
    paddingRight: 18
  },
  datePill: {
    minWidth: 92,
    borderRadius: 8,
    padding: 12,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line
  },
  datePillActive: {
    backgroundColor: palette.copper
  },
  dateText: {
    color: palette.muted,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  dateTextActive: {
    color: palette.cream
  },
  closedText: {
    color: palette.danger,
    fontSize: 11,
    marginTop: 4,
    fontWeight: "800"
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "rgba(223, 180, 100, 0.08)",
    borderWidth: 1,
    borderColor: palette.line
  },
  summaryText: {
    flex: 1,
    color: palette.cream,
    lineHeight: 20
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  slot: {
    width: "30.8%",
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.panelSoft,
    borderWidth: 1,
    borderColor: palette.line
  },
  slotSelected: {
    backgroundColor: palette.gold,
    borderColor: palette.gold
  },
  slotText: {
    color: palette.gold,
    fontWeight: "900",
    fontSize: 16
  },
  slotTextSelected: {
    color: palette.ink
  },
  card: {
    backgroundColor: palette.panel,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 10
  },
  compactCard: {
    marginTop: 8
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  cardTitle: {
    color: palette.cream,
    fontSize: 16,
    fontWeight: "900"
  },
  cardText: {
    color: palette.muted,
    lineHeight: 20
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(196, 122, 58, 0.18)"
  },
  badgeText: {
    color: palette.gold,
    fontSize: 11,
    fontWeight: "900"
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  miniButton: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: "rgba(223, 180, 100, 0.12)",
    borderWidth: 1,
    borderColor: palette.line
  },
  miniButtonDanger: {
    backgroundColor: "rgba(224, 108, 88, 0.12)",
    borderColor: "rgba(224, 108, 88, 0.24)"
  },
  miniButtonText: {
    color: palette.gold,
    fontWeight: "900"
  },
  miniButtonTextDanger: {
    color: palette.danger
  },
  iconActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(223, 180, 100, 0.12)",
    borderWidth: 1,
    borderColor: palette.line
  },
  iconButtonDanger: {
    backgroundColor: "rgba(224, 108, 88, 0.12)",
    borderColor: "rgba(224, 108, 88, 0.24)"
  },
  empty: {
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.line,
    borderStyle: "dashed"
  },
  emptyText: {
    color: palette.muted,
    textAlign: "center"
  },
  productGrid: {
    gap: 12
  },
  carouselRow: {
    gap: 12,
    paddingRight: 18
  },
  carouselCard: {
    width: 300
  },
  carouselImage: {
    width: "100%",
    height: 170,
    backgroundColor: palette.panelSoft
  },
  viewMoreCard: {
    width: 140,
    minHeight: 170,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(223, 180, 100, 0.10)",
    borderWidth: 1,
    borderColor: palette.line
  },
  viewMoreText: {
    color: palette.gold,
    fontWeight: "900",
    fontSize: 15
  },
  productCard: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: palette.panelSoft
  },
  productBody: {
    padding: 14,
    gap: 8
  },
  price: {
    color: palette.gold,
    fontSize: 17,
    fontWeight: "900"
  },
  stock: {
    color: palette.success,
    fontWeight: "900"
  },
  stockOff: {
    color: palette.danger
  },
  galleryGrid: {
    gap: 12
  },
  galleryCard: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line,
    paddingBottom: 12
  },
  galleryImage: {
    width: "100%",
    height: 210,
    backgroundColor: palette.panelSoft
  },
  galleryPickerPreview: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor: palette.panelSoft,
    marginBottom: 8
  },
  imageSelectedText: {
    color: palette.success,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 12
  },
  imageDebugText: {
    color: palette.muted,
    fontSize: 11,
    marginBottom: 8
  },
  galleryTitle: {
    color: palette.cream,
    fontWeight: "900",
    fontSize: 16,
    padding: 12
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metric: {
    width: "48.4%",
    borderRadius: 8,
    padding: 16,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line
  },
  metricValue: {
    color: palette.gold,
    fontSize: 30,
    fontFamily: "Georgia",
    fontWeight: "700"
  },
  metricLabel: {
    color: palette.muted,
    marginTop: 4,
    fontWeight: "800"
  },
  metricDetail: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16
  },
  dashboardHeroCard: {
    borderRadius: 8,
    padding: 18,
    gap: 8,
    backgroundColor: "rgba(223, 180, 100, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(223, 180, 100, 0.34)"
  },
  dashboardEyebrow: {
    color: palette.gold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    fontWeight: "900"
  },
  dashboardRevenue: {
    color: palette.cream,
    fontSize: 36,
    fontFamily: "Georgia",
    fontWeight: "700"
  },
  dashboardMuted: {
    color: palette.muted,
    fontWeight: "800"
  },
  dashboardPanel: {
    borderRadius: 8,
    padding: 14,
    gap: 12,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line
  },
  dashboardList: {
    gap: 10
  },
  dashboardListRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.035)"
  },
  dashboardRank: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.gold
  },
  dashboardRankText: {
    color: palette.ink,
    fontWeight: "900"
  },
  dashboardListContent: {
    flex: 1,
    minWidth: 0
  },
  dayPanel: {
    borderRadius: 8,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: palette.line,
    marginBottom: 12
  },
  dayPanelFeatured: {
    backgroundColor: "rgba(33, 23, 15, 0.92)"
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  dayTitle: {
    color: palette.cream,
    fontSize: 17,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  dayMeta: {
    color: palette.gold,
    fontWeight: "800"
  },
  adminAgendaHero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14
  },
  adminAgendaCounter: {
    minWidth: 64,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: palette.gold
  },
  adminAgendaCounterValue: {
    color: palette.ink,
    fontSize: 24,
    fontFamily: "Georgia",
    fontWeight: "700"
  },
  adminAgendaCounterLabel: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: "900"
  },
  adminAgendaSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 2,
    paddingBottom: 14,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(223, 180, 100, 0.12)"
  },
  adminAgendaSummaryText: {
    color: palette.cream,
    fontWeight: "900"
  },
  adminAgendaSummaryMuted: {
    color: palette.muted,
    fontWeight: "800"
  },
  adminCalendar: {
    borderRadius: 8,
    padding: 12,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: palette.line
  },
  adminCalendarInput: {
    minHeight: 66,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: palette.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  adminCalendarInputLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  adminCalendarInputValue: {
    color: palette.cream,
    fontSize: 18,
    fontFamily: "Georgia",
    fontWeight: "700",
    marginTop: 2,
    textTransform: "capitalize"
  },
  adminCalendarInputAction: {
    color: palette.gold,
    fontWeight: "900"
  },
  adminCalendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  adminCalendarTitle: {
    color: palette.cream,
    fontWeight: "900",
    fontSize: 16
  },
  adminCalendarMonth: {
    color: palette.gold,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  adminCalendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  adminCalendarDay: {
    width: "23.2%",
    minHeight: 76,
    borderRadius: 8,
    justifyContent: "center",
    padding: 8,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line
  },
  adminCalendarDayActive: {
    backgroundColor: palette.gold,
    borderColor: palette.gold
  },
  adminCalendarWeekday: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  adminCalendarNumber: {
    color: palette.cream,
    fontSize: 20,
    fontFamily: "Georgia",
    fontWeight: "700",
    marginTop: 4
  },
  adminCalendarTextActive: {
    color: palette.ink
  },
  adminCalendarClosed: {
    color: palette.danger,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3
  },
  settingsRow: {
    gap: 10,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(223, 180, 100, 0.12)"
  },
  settingsRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  settingsTimeRow: {
    flexDirection: "row",
    gap: 10
  },
  settingsTimeInput: {
    flex: 1,
    textAlign: "center",
    fontWeight: "900"
  },
  closedDatePickerRow: {
    gap: 10
  },
  closedDateInput: {
    minHeight: 62
  },
  closedDatesList: {
    gap: 10
  },
  closedDateRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.035)"
  },
  timelineList: {
    gap: 10
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1
  },
  timelineItemBusy: {
    backgroundColor: "rgba(223, 180, 100, 0.11)",
    borderColor: "rgba(223, 180, 100, 0.32)"
  },
  timelineItemBlocked: {
    backgroundColor: "rgba(224, 108, 88, 0.10)",
    borderColor: "rgba(224, 108, 88, 0.28)"
  },
  timelineTimeRail: {
    width: 54,
    alignItems: "center",
    gap: 8
  },
  timelineTime: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.gold
  },
  timelineDotMuted: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.danger
  },
  timelineDotFree: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(181,159,130,0.45)"
  },
  timelineContent: {
    flex: 1,
    gap: 6
  },
  timelineBadge: {
    color: palette.gold,
    fontSize: 11,
    fontWeight: "900"
  },
  timelineFreeText: {
    color: palette.muted,
    fontWeight: "800"
  },
  timelineFreeRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.018)"
  },
  timelineFreeTime: {
    width: 54,
    color: palette.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line,
    marginTop: 8
  },
  infoContent: {
    flex: 1
  },
  bottomTabs: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "rgba(16, 13, 10, 0.96)",
    borderTopWidth: 1,
    borderTopColor: palette.line
  },
  bottomTabsScroll: {
    gap: 8,
    minWidth: "100%"
  },
  bottomTabsScrollCentered: {
    justifyContent: "center"
  },
  tabButton: {
    minWidth: 70,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 4,
    backgroundColor: palette.panel
  },
  tabButtonActive: {
    backgroundColor: palette.gold
  },
  tabText: {
    color: palette.muted,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  tabTextActive: {
    color: palette.ink
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(16, 13, 10, 0.74)"
  },
  modalCard: {
    maxHeight: "86%",
    borderRadius: 8,
    padding: 18,
    gap: 12,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.line
  },
  modalScroll: {
    flexGrow: 0
  },
  modalScrollContent: {
    gap: 12,
    paddingBottom: 4
  },
  modalTitle: {
    color: palette.cream,
    fontSize: 22,
    fontFamily: "Georgia",
    fontWeight: "700"
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6
  }
});


