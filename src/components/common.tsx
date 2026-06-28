import React, { useState } from "react";
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  ArrowLeftRight,
  CalendarDays,
  CalendarX,
  ChartNoAxesColumn,
  Ellipsis,
  Eye,
  EyeOff,
  Home,
  Images,
  Lock,
  Pencil,
  Repeat2,
  Scissors,
  Settings,
  ShoppingBag,
  Trash2,
  User,
  Users
} from "lucide-react-native";
import type { Role } from "../types";
import { dateLabel } from "../utils/date";
import { palette, styles } from "../theme";

const appLogo = require("../../assets/logo.png");

export type AppIconName =
  | "bag"
  | "calendar"
  | "calendar-clear"
  | "cut"
  | "ellipsis-horizontal"
  | "eye"
  | "eye-off"
  | "home"
  | "images"
  | "lock-closed"
  | "pencil"
  | "people"
  | "person"
  | "repeat"
  | "settings"
  | "stats-chart"
  | "swap-horizontal"
  | "trash";

const iconComponents: Record<AppIconName, LucideIcon> = {
  bag: ShoppingBag,
  calendar: CalendarDays,
  "calendar-clear": CalendarX,
  cut: Scissors,
  "ellipsis-horizontal": Ellipsis,
  eye: Eye,
  "eye-off": EyeOff,
  home: Home,
  images: Images,
  "lock-closed": Lock,
  pencil: Pencil,
  people: Users,
  person: User,
  repeat: Repeat2,
  settings: Settings,
  "stats-chart": ChartNoAxesColumn,
  "swap-horizontal": ArrowLeftRight,
  trash: Trash2
};

export function AppIcon({ name, size = 20, color = palette.gold }: { name: AppIconName; size?: number; color?: string }) {
  const Icon = iconComponents[name];
  return (
    <View style={styles.appIcon}>
      <Icon size={size} color={color} strokeWidth={2.2} />
    </View>
  );
}

export function Header({ role }: { role: Role }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerBrand}>
        <Image source={appLogo} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>BarberTche</Text>
          <Text style={styles.headerTitle}>{role === "client" ? "Area do cliente" : "Comando da barbearia"}</Text>
        </View>
      </View>
    </View>
  );
}

export function HeroCard({ title, text, action, onPress }: { title: string; text: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroText}>{text}</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
        <Text style={styles.primaryButtonText}>{action}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionText}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => (
        <TouchableOpacity key={option.value} style={[styles.segment, value === option.value && styles.segmentActive]} onPress={() => onChange(option.value)}>
          <Text style={[styles.segmentText, value === option.value && styles.segmentTextActive]}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function DateStrip({
  dates,
  selectedDate,
  closedDates,
  onSelect
}: {
  dates: string[];
  selectedDate: string;
  closedDates: string[];
  onSelect: (date: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
      {dates.map((date) => (
        <TouchableOpacity key={date} style={[styles.datePill, date === selectedDate && styles.datePillActive]} onPress={() => onSelect(date)}>
          <Text style={[styles.dateText, date === selectedDate && styles.dateTextActive]}>{dateLabel(date)}</Text>
          {closedDates.includes(date) ? <Text style={styles.closedText}>fechado</Text> : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export function BottomTabs({
  tabs,
  active,
  onChange
}: {
  tabs: [string, string, AppIconName][];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <View style={styles.bottomTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.bottomTabsScroll, tabs.length <= 4 && styles.bottomTabsScrollCentered]}>
        {tabs.map(([value, label, icon]) => (
          <TouchableOpacity key={value} style={[styles.tabButton, active === value && styles.tabButtonActive]} onPress={() => onChange(value)}>
            <AppIcon name={icon} size={20} color={active === value ? palette.ink : palette.muted} />
            <Text style={[styles.tabText, active === value && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {children}
    </ScrollView>
  );
}

export function Chip({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function SelectField<T extends string>({
  value,
  options,
  placeholder = "Selecione",
  onChange
}: {
  value: T;
  options: { label: string; value: T }[];
  placeholder?: string;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.selectFieldWrapper}>
      <TouchableOpacity style={[styles.selectField, open && styles.selectFieldOpen]} onPress={() => setOpen((current) => !current)} activeOpacity={0.84}>
        <Text style={[styles.selectFieldText, !selectedOption && styles.selectFieldPlaceholder]}>{selectedOption?.label ?? placeholder}</Text>
        <Text style={styles.selectFieldArrow}>{open ? "Fechar" : "Alterar"}</Text>
      </TouchableOpacity>
      {open ? (
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={options.length > 5} style={styles.selectDropdown}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.selectDropdownOption, active && styles.selectDropdownOptionActive]}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Text style={[styles.selectDropdownOptionText, active && styles.selectDropdownOptionTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function InfoRow({ title, detail, icon, onPress }: { title: string; detail: string; icon: AppIconName; onPress?: () => void }) {
  const content = (
    <>
      <AppIcon name={icon} size={18} color={palette.gold} />
      <View style={styles.infoContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{detail}</Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.infoRow} onPress={onPress} activeOpacity={0.82}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.infoRow}>{content}</View>;
}

export function ManagementCard({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{detail}</Text>
      {children}
    </View>
  );
}

export function MiniButton({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.miniButton, danger && styles.miniButtonDanger]} onPress={onPress}>
      <Text style={[styles.miniButtonText, danger && styles.miniButtonTextDanger]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function IconButton({ icon, danger, onPress }: { icon: AppIconName; danger?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.iconButton, danger && styles.iconButtonDanger]} onPress={onPress} activeOpacity={0.82}>
      <AppIcon name={icon} size={17} color={danger ? palette.danger : palette.gold} />
    </TouchableOpacity>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <AppIcon name="calendar-clear" size={22} color={palette.muted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function ConfirmActionModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onClose
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.cardText}>{message}</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, styles.dangerButton]} onPress={onConfirm}>
              <Text style={styles.primaryButtonText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
