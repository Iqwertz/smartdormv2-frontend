import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Link as MuiLink,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import DashboardCard from "../../components/shared/DashboardCard";
import { useNotification } from "../../context/NotificationContext";
import { fetchMembershipTerms, submitMembershipApplication } from "../../services/membershipService";
import { MembershipTermsResponse, PaymentMethod } from "../../types/membership";
import { formatIban, ibanError, normalizeIban } from "../../utils/iban";

/** Small helper so the long legal paragraphs all render the same way. */
const LegalText: React.FC<{ children: React.ReactNode; small?: boolean }> = ({ children, small }) => (
  <Typography
    variant="body2"
    color="text.secondary"
    sx={{ mb: 1.5, fontSize: small ? "0.75rem" : undefined, lineHeight: 1.6 }}
  >
    {children}
  </Typography>
);

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Divider sx={{ my: 3 }} />
    <Typography variant="h6" gutterBottom>
      {children}
    </Typography>
  </>
);

const MembershipJoinPage: React.FC = () => {
  const [terms, setTerms] = useState<MembershipTermsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [joinDate, setJoinDate] = useState<Dayjs | null>(dayjs().add(1, "month").startOf("month"));
  const [isOfAge, setIsOfAge] = useState<"yes" | "no" | "">("");
  // Default is "no answer": the Amtsliste consent is voluntary and must not be pre-ticked.
  const [amtslisteConsent, setAmtslisteConsent] = useState<"consent" | "none">("none");
  const [statutesAccepted, setStatutesAccepted] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("SEPA");
  const [holderFirstName, setHolderFirstName] = useState("");
  const [holderLastName, setHolderLastName] = useState("");
  const [iban, setIban] = useState("");
  const [mandateConfirmed, setMandateConfirmed] = useState(false);

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMembershipTerms();
        setTerms(data);
        setFirstName(data.prefill.first_name);
        setLastName(data.prefill.last_name);
        setHolderFirstName(data.prefill.first_name);
        setHolderLastName(data.prefill.last_name);
      } catch {
        setLoadError("Die Beitrittserklärung konnte nicht geladen werden. Bitte versuche es später erneut.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isSepa = paymentMethod === "SEPA";
  const ibanValidationError = useMemo(() => (isSepa ? ibanError(iban) : null), [iban, isSepa]);

  const isFormValid =
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    Boolean(joinDate?.isValid()) &&
    isOfAge === "yes" &&
    statutesAccepted &&
    (!isSepa ||
      (Boolean(holderFirstName.trim()) &&
        Boolean(holderLastName.trim()) &&
        Boolean(iban.trim()) &&
        !ibanValidationError &&
        mandateConfirmed));

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || !joinDate) {
      setError("Bitte fülle alle erforderlichen Felder aus.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await submitMembershipApplication({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        requested_join_date: joinDate.format("YYYY-MM-DD"),
        is_of_age: isOfAge === "yes",
        amtsliste_consent: amtslisteConsent === "consent",
        statutes_accepted: statutesAccepted,
        payment_method: paymentMethod,
        account_holder_first_name: isSepa ? holderFirstName.trim() : "",
        account_holder_last_name: isSepa ? holderLastName.trim() : "",
        iban: isSepa ? normalizeIban(iban) : "",
        mandate_confirmed: isSepa ? mandateConfirmed : false,
      });
      showNotification(response.message, "success");
      navigate("/dashboard");
    } catch (err: any) {
      const data = err.response?.data;
      // DRF returns either {error: "..."} or a per-field map; flatten both into one message.
      const message =
        data?.error ||
        (data && typeof data === "object"
          ? Object.values(data)
              .flat()
              .join(" ")
          : null) ||
        "Der Antrag konnte nicht abgeschickt werden.";
      setError(message);
      showNotification(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isFormValid, joinDate, firstName, lastName, isOfAge, amtslisteConsent, statutesAccepted,
    paymentMethod, isSepa, holderFirstName, holderLastName, iban, mandateConfirmed,
    showNotification, navigate,
  ]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !terms) {
    return (
      <Box sx={{ maxWidth: "900px", margin: "0 auto", p: 2 }}>
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  const t = terms.terms;

  return (
    <Box sx={{ maxWidth: "900px", margin: "0 auto" }} className="page-root">
      <DashboardCard title={t.title}>
        <Box sx={{ p: 1 }}>
          <LegalText>
            {t.intro}{" "}
            {terms.privacy_policy_url && (
              <MuiLink href={terms.privacy_policy_url} target="_blank" rel="noopener">
                Zur Datenschutzerklärung
              </MuiLink>
            )}
          </LegalText>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>{t.welcome}</Typography>

          <Typography variant="h6">{t.declaration_heading}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t.declaration_subheading}
          </Typography>

          {/* --- Daten --- */}
          <SectionHeading>Daten</SectionHeading>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Vorname(n)"
                fullWidth
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nachname(n)"
                fullWidth
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Gewünschtes Beitrittsdatum"
                value={joinDate}
                onChange={setJoinDate}
                format="DD.MM.YYYY"
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl required>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Bist du mindestens 18 Jahre alt?
                </Typography>
                <RadioGroup row value={isOfAge} onChange={(e) => setIsOfAge(e.target.value as "yes" | "no")}>
                  <FormControlLabel value="yes" control={<Radio />} label="Ja" />
                  <FormControlLabel value="no" control={<Radio />} label="Nein" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          {isOfAge === "no" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t.minor_notice}
            </Alert>
          )}

          {/* --- Einwilligung Amtsliste --- */}
          <SectionHeading>Einwilligung Amtsliste</SectionHeading>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Bitte wähle eine der folgenden Antworten. Diese Einwilligung ist freiwillig und hat keinen Einfluss auf
            deinen Beitritt.
          </Typography>
          <RadioGroup
            value={amtslisteConsent}
            onChange={(e) => setAmtslisteConsent(e.target.value as "consent" | "none")}
          >
            <FormControlLabel
              value="consent"
              control={<Radio />}
              sx={{ alignItems: "flex-start", mb: 1 }}
              label={<LegalText>{t.amtsliste_consent_label}</LegalText>}
            />
            <FormControlLabel value="none" control={<Radio />} label={t.amtsliste_decline_label} />
          </RadioGroup>

          {/* --- Satzung --- */}
          <SectionHeading>Satzung und Mitgliedsbeitrag</SectionHeading>
          <LegalText>{t.duty_to_notify}</LegalText>
          <LegalText>{t.statutes_acknowledgement}</LegalText>
          <LegalText>{t.automatic_end}</LegalText>
          <FormControlLabel
            control={<Checkbox checked={statutesAccepted} onChange={(e) => setStatutesAccepted(e.target.checked)} />}
            label="Ich erkenne die Satzung und die Vereinsordnungen an und bestätige die obenstehenden Angaben."
          />
          {terms.statutes_url && (
            <Box sx={{ mt: 1 }}>
              <MuiLink href={terms.statutes_url} target="_blank" rel="noopener">
                Satzung im Wortlaut
              </MuiLink>
            </Box>
          )}
          <LegalText small>{t.privacy_notice}</LegalText>

          {/* --- SEPA --- */}
          <SectionHeading>{t.sepa_heading}</SectionHeading>
          <LegalText>{t.sepa_creditor}</LegalText>

          <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            <FormControlLabel
              value="SEPA"
              control={<Radio />}
              sx={{ alignItems: "flex-start" }}
              label={<LegalText>{t.sepa_consent_label}</LegalText>}
            />
            <FormControlLabel
              value="OTHER"
              control={<Radio />}
              sx={{ alignItems: "flex-start" }}
              label={<LegalText>{t.sepa_alternative_label}</LegalText>}
            />
          </RadioGroup>

          {isSepa && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Zahler:in / Kontoinhaber:in
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Vorname(n)"
                    fullWidth
                    required
                    value={holderFirstName}
                    onChange={(e) => setHolderFirstName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Nachname(n)"
                    fullWidth
                    required
                    value={holderLastName}
                    onChange={(e) => setHolderLastName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="IBAN"
                    fullWidth
                    required
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    onBlur={() => setIban(formatIban(iban))}
                    error={Boolean(ibanValidationError)}
                    helperText={ibanValidationError || "z. B. DE89 3704 0044 0532 0130 00"}
                    slotProps={{ htmlInput: { spellCheck: false, autoComplete: "off" } }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <LegalText>{t.sepa_mandate_reference_note}</LegalText>
                <LegalText>{t.sepa_authorisation}</LegalText>
                <LegalText>{t.sepa_payment_type}</LegalText>
                <LegalText>{t.sepa_prenotification}</LegalText>
              </Box>

              <FormControlLabel
                sx={{ alignItems: "flex-start", mt: 1 }}
                control={
                  <Checkbox checked={mandateConfirmed} onChange={(e) => setMandateConfirmed(e.target.checked)} />
                }
                label={<LegalText>{t.sepa_consent_label}</LegalText>}
              />

              <LegalText small>{t.sepa_documentation_note}</LegalText>
              <LegalText small>{t.sepa_privacy_notice}</LegalText>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
            <Button onClick={() => navigate("/dashboard")} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Beitrittserklärung absenden"}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, textAlign: "right" }}>
            Textfassung {terms.terms_version}
          </Typography>
        </Box>
      </DashboardCard>
    </Box>
  );
};

export default MembershipJoinPage;
