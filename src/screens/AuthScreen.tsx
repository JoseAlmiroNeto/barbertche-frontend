import React from "react";
import { ActivityIndicator, Image, ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Segmented } from "../components/common";
import { palette, styles } from "../theme";

const appLogo = require("../../assets/logo.png");

export type AuthMode = "login" | "register";

export function AuthScreen({
  mode,
  name,
  phone,
  email,
  password,
  passwordConfirmation,
  submitting,
  onModeChange,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmationChange,
  onSubmit
}: {
  mode: AuthMode;
  name: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  submitting?: boolean;
  onModeChange: (mode: AuthMode) => void;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onPasswordConfirmationChange: (password: string) => void;
  onSubmit: () => void;
}) {
  const isRegister = mode === "register";

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80" }}
      style={styles.authHero}
      imageStyle={styles.authImage}
    >
      <View style={styles.authShade}>
        <View style={styles.authBrandBlock}>
          <View style={styles.brandMark}>
            <Image source={appLogo} style={styles.brandMarkLogo} resizeMode="contain" />
          </View>
          <View style={styles.authRule} />
          <Text style={styles.kicker}>Barbearia Premium</Text>
          <Text style={styles.authTitle}>BarberTche</Text>
          <Text style={styles.authText}>Agenda clara, horarios protegidos e vitrine elegante para cortes e produtos.</Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.authCardTitle}>{isRegister ? "Criar conta" : "Acessar conta"}</Text>
          <Segmented
            options={[
              { label: "Entrar", value: "login" },
              { label: "Criar conta", value: "register" }
            ]}
            value={mode}
            onChange={onModeChange}
          />

          {isRegister ? (
            <>
              <View style={styles.authFieldGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput value={name} onChangeText={onNameChange} placeholder="Seu nome" placeholderTextColor={palette.muted} style={styles.input} />
              </View>
              <View style={styles.authFieldGroup}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput value={phone} onChangeText={onPhoneChange} placeholder="(51) 99999-0000" placeholderTextColor={palette.muted} style={styles.input} keyboardType="phone-pad" />
              </View>
            </>
          ) : null}

          <View style={styles.authFieldGroup}>
            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput value={email} onChangeText={onEmailChange} placeholder="exemplo@email.com" placeholderTextColor={palette.muted} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.authFieldGroup}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput value={password} onChangeText={onPasswordChange} placeholder="Sua senha" placeholderTextColor={palette.muted} style={styles.input} secureTextEntry />
          </View>
          {isRegister ? (
            <View style={styles.authFieldGroup}>
              <Text style={styles.inputLabel}>Confirmar senha</Text>
              <TextInput value={passwordConfirmation} onChangeText={onPasswordConfirmationChange} placeholder="Digite a senha novamente" placeholderTextColor={palette.muted} style={styles.input} secureTextEntry />
            </View>
          ) : null}

          <TouchableOpacity style={[styles.primaryButton, styles.authSubmitButton, submitting && styles.primaryButtonDisabled]} onPress={submitting ? undefined : onSubmit}>
            {submitting ? <ActivityIndicator color="#100d0a" /> : <Text style={styles.primaryButtonText}>{isRegister ? "Criar conta" : "Entrar"}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}



