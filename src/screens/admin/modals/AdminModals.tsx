import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { BusinessHours, Client, Service } from "../../../types";
import {
  Chip,
  ChipRow,
  EmptyState,
  SectionTitle,
  SelectField,
} from "../../../components/common";
import { styles } from "../../../theme";
import { dateLabel, weekdayName } from "../../../utils/date";
import { toMinutes, toTime } from "../../../utils/time";

function buildStartOptions(open: string, close: string, duration: number) {
  const slots: string[] = [];
  for (
    let cursor = toMinutes(open);
    cursor + duration <= toMinutes(close);
    cursor += 30
  ) {
    slots.push(toTime(cursor));
  }
  return slots;
}

type BaseModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function ClientModal({
  visible,
  name,
  phone,
  onChangeName,
  onChangePhone,
  onConfirm,
  onClose,
}: BaseModalProps & {
  name: string;
  phone: string;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Cadastrar cliente</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.cardText}>
              Informe o nome e o telefone do cliente para usar em agendamentos
              manuais e fixos.
            </Text>
            <TextInput
              value={name}
              onChangeText={onChangeName}
              placeholder="Nome do cliente"
              placeholderTextColor="#b59f82"
              style={styles.input}
            />
            <TextInput
              value={phone}
              onChangeText={onChangePhone}
              placeholder="Telefone. Ex: (51) 99999-0000"
              placeholderTextColor="#b59f82"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onConfirm}>
              <Text style={styles.primaryButtonText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function RecurringModal({
  visible,
  editingRecurringId,
  clients,
  services,
  businessHours,
  recurringClientId,
  recurringServiceId,
  recurringWeekday,
  recurringStart,
  recurringStartOptions,
  selectedRecurringServiceDuration,
  onSelectClient,
  onSelectService,
  onSelectWeekday,
  onSelectStart,
  onConfirm,
  onClose,
}: BaseModalProps & {
  editingRecurringId: string | null;
  clients: Client[];
  services: Service[];
  businessHours: BusinessHours;
  recurringClientId: string;
  recurringServiceId: string;
  recurringWeekday: number;
  recurringStart: string;
  recurringStartOptions: string[];
  selectedRecurringServiceDuration: number;
  onSelectClient: (clientId: string) => void;
  onSelectService: (service: Service) => void;
  onSelectWeekday: (weekday: number, nextStart: string) => void;
  onSelectStart: (start: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {editingRecurringId
              ? "Editar agendamento fixo"
              : "Criar agendamento fixo"}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.cardText}>
              Selecione o cliente, serviÃ§o, dia da semana e horÃ¡rio
              recorrente.
            </Text>
            <SectionTitle title="Cliente" />
            <SelectField
              value={recurringClientId}
              options={clients.map((client) => ({
                label: client.name,
                value: client.id,
              }))}
              placeholder="Selecione um cliente"
              onChange={onSelectClient}
            />
            <SectionTitle title="ServiÃ§o" />
            <ChipRow>
              {services
                .filter((service) => service.active)
                .map((service) => (
                  <Chip
                    key={service.id}
                    active={service.id === recurringServiceId}
                    onPress={() => onSelectService(service)}
                  >
                    {service.name}
                  </Chip>
                ))}
            </ChipRow>
            <SectionTitle title="Dia da semana" />
            <ChipRow>
              {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
                const hours = businessHours[weekday];
                const nextStart = hours
                  ? (buildStartOptions(
                      hours.open,
                      hours.close,
                      selectedRecurringServiceDuration,
                    )[0] ?? hours.open)
                  : "09:00";
                return (
                  <Chip
                    key={weekday}
                    active={weekday === recurringWeekday}
                    onPress={() => onSelectWeekday(weekday, nextStart)}
                  >
                    {weekdayName(weekday)}
                  </Chip>
                );
              })}
            </ChipRow>
            <SectionTitle title="HorÃ¡rio" />
            {recurringStartOptions.length > 0 ? (
              <View style={styles.slotGrid}>
                {recurringStartOptions.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slot,
                      recurringStart === slot && styles.slotSelected,
                    ]}
                    onPress={() => onSelectStart(slot)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        recurringStart === slot && styles.slotTextSelected,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState text="Esse dia nÃ£o possui expediente configurado." />
            )}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={recurringStartOptions.length > 0 ? onConfirm : undefined}
            >
              <Text style={styles.primaryButtonText}>
                {editingRecurringId ? "Salvar" : "Criar fixo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ServiceModal({
  visible,
  editingServiceId,
  name,
  price,
  duration,
  saving,
  onChangeName,
  onChangePrice,
  onChangeDuration,
  onConfirm,
  onClose,
}: BaseModalProps & {
  editingServiceId: string | null;
  name: string;
  price: string;
  duration: string;
  saving?: boolean;
  onChangeName: (value: string) => void;
  onChangePrice: (value: string) => void;
  onChangeDuration: (value: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {editingServiceId ? "Editar serviÃ§o" : "Novo serviÃ§o"}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.cardText}>
              Cadastre o serviÃ§o com nome, preÃ§o e tempo mÃ©dio de
              atendimento.
            </Text>
            <TextInput
              value={name}
              onChangeText={onChangeName}
              placeholder="Nome do serviÃ§o"
              placeholderTextColor="#b59f82"
              style={styles.input}
            />
            <TextInput
              value={price}
              onChangeText={onChangePrice}
              placeholder="PreÃ§o. Ex: 70,00"
              placeholderTextColor="#b59f82"
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <TextInput
              value={duration}
              onChangeText={onChangeDuration}
              placeholder="Tempo em minutos. Ex: 45"
              placeholderTextColor="#b59f82"
              keyboardType="number-pad"
              style={styles.input}
            />
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                saving && styles.primaryButtonDisabled,
              ]}
              onPress={saving ? undefined : onConfirm}
            >
              {saving ? (
                <ActivityIndicator color="#100d0a" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {editingServiceId ? "Salvar" : "Cadastrar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ProductModal({
  visible,
  editingProductId,
  name,
  price,
  saving,
  onChangeName,
  onChangePrice,
  onConfirm,
  onClose,
}: BaseModalProps & {
  editingProductId: string | null;
  name: string;
  price: string;
  saving?: boolean;
  onChangeName: (value: string) => void;
  onChangePrice: (value: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {editingProductId ? "Editar produto" : "Novo produto"}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.cardText}>
              Cadastre o produto com nome e valor de venda.
            </Text>
            <TextInput
              value={name}
              onChangeText={onChangeName}
              placeholder="Nome do produto"
              placeholderTextColor="#b59f82"
              style={styles.input}
            />
            <TextInput
              value={price}
              onChangeText={onChangePrice}
              placeholder="Valor. Ex: 59,90"
              placeholderTextColor="#b59f82"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                saving && styles.primaryButtonDisabled,
              ]}
              onPress={saving ? undefined : onConfirm}
            >
              {saving ? (
                <ActivityIndicator color="#100d0a" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {editingProductId ? "Salvar" : "Cadastrar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function GalleryModal({
  visible,
  editingGalleryId,
  title,
  image,
  onChangeTitle,
  onPickImage,
  onConfirm,
  onClose,
}: BaseModalProps & {
  editingGalleryId: string | null;
  title: string;
  image: string;
  onChangeTitle: (value: string) => void;
  onPickImage: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {editingGalleryId ? "Editar imagem" : "Nova imagem"}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.cardText}>
              Cadastre um nome para o corte e selecione a foto que serÃ¡ exibida
              no portfÃ³lio.
            </Text>
            <TextInput
              value={title}
              onChangeText={onChangeTitle}
              placeholder="Nome do corte"
              placeholderTextColor="#b59f82"
              style={styles.input}
            />
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.galleryPickerPreview}
              />
            ) : null}
            <TouchableOpacity
              style={styles.secondaryButtonFull}
              onPress={onPickImage}
            >
              <Text style={styles.secondaryButtonText}>
                {image ? "Trocar foto" : "Selecionar foto"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onConfirm}>
              <Text style={styles.primaryButtonText}>
                {editingGalleryId ? "Salvar" : "Cadastrar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ManualBookingModal({
  visible,
  selectedDate,
  saving,
  services,
  selectedDateHours,
  occupiedStarts,
  clientName,
  serviceId,
  bookingStart,
  bookingSlots,
  onChangeClientName,
  onSelectService,
  onSelectStart,
  onConfirm,
  onClose,
}: BaseModalProps & {
  selectedDate: string;
  saving?: boolean;
  services: Service[];
  selectedDateHours?: { open: string; close: string } | null;
  occupiedStarts: string[];
  clientName: string;
  serviceId: string;
  bookingStart: string;
  bookingSlots: string[];
  onChangeClientName: (value: string) => void;
  onSelectService: (serviceId: string, nextStart: string) => void;
  onSelectStart: (start: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Agendar balcÃ£o</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.cardText}>{dateLabel(selectedDate)}</Text>
            <TextInput
              value={clientName}
              onChangeText={onChangeClientName}
              placeholder="Nome do cliente"
              placeholderTextColor="#b59f82"
              style={styles.input}
            />
            <SectionTitle title="ServiÃ§o" />
            <ChipRow>
              {services
                .filter((service) => service.active)
                .map((service) => {
                  const nextSlots = selectedDateHours
                    ? buildStartOptions(
                        selectedDateHours.open,
                        selectedDateHours.close,
                        service.duration,
                      ).filter((slot) => !occupiedStarts.includes(slot))
                    : [];

                  return (
                    <Chip
                      key={service.id}
                      active={service.id === serviceId}
                      onPress={() =>
                        onSelectService(
                          service.id,
                          nextSlots[0] ?? selectedDateHours?.open ?? "09:00",
                        )
                      }
                    >
                      {service.name} - {service.duration}min
                    </Chip>
                  );
                })}
            </ChipRow>
            <SectionTitle title="HorÃ¡rio" />
            <View style={styles.slotGrid}>
              {bookingSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slot,
                    bookingStart === slot && styles.slotSelected,
                  ]}
                  onPress={() => onSelectStart(slot)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      bookingStart === slot && styles.slotTextSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {bookingSlots.length === 0 ? (
              <EmptyState text="Sem horÃ¡rios livres para este serviÃ§o neste dia." />
            ) : null}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                saving && styles.primaryButtonDisabled,
              ]}
              onPress={
                bookingSlots.length > 0 && !saving ? onConfirm : undefined
              }
            >
              {saving ? (
                <ActivityIndicator color="#100d0a" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ManualBlockModal({
  visible,
  selectedDate,
  saving,
  reason,
  start,
  duration,
  startOptions,
  onChangeReason,
  onSelectStart,
  onSelectDuration,
  onConfirm,
  onClose,
}: BaseModalProps & {
  selectedDate: string;
  saving?: boolean;
  reason: string;
  start: string;
  duration: number;
  startOptions: string[];
  onChangeReason: (value: string) => void;
  onSelectStart: (start: string) => void;
  onSelectDuration: (duration: number) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Bloquear horÃ¡rio</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.cardText}>{dateLabel(selectedDate)}</Text>
            <TextInput
              value={reason}
              onChangeText={onChangeReason}
              placeholder="Motivo"
              placeholderTextColor="#b59f82"
              style={styles.input}
            />
            <SectionTitle title="InÃ­cio" />
            <View style={styles.slotGrid}>
              {startOptions.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slot, start === slot && styles.slotSelected]}
                  onPress={() => onSelectStart(slot)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      start === slot && styles.slotTextSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <SectionTitle title="DuraÃ§Ã£o" />
            <View style={styles.actionRow}>
              {[30, 60, 90, 120].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.miniButton,
                    duration === option && styles.slotSelected,
                  ]}
                  onPress={() => onSelectDuration(option)}
                >
                  <Text
                    style={[
                      styles.miniButtonText,
                      duration === option && styles.slotTextSelected,
                    ]}
                  >
                    {option} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                saving && styles.primaryButtonDisabled,
              ]}
              onPress={saving ? undefined : onConfirm}
            >
              {saving ? (
                <ActivityIndicator color="#100d0a" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
