import { useForm } from "@tanstack/react-form";
import { useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Use at least 8 characters"),
});

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (typeof error === "string") return error;

  if (Array.isArray(error)) {
    for (const issue of error) {
      const message = getErrorMessage(issue);
      if (message) return message;
    }
    return null;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as { message?: unknown };
    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
  }

  return null;
}

function SignIn({ onSuccess }: { onSuccess?: () => void }) {
  const passwordInputRef = useRef<TextInput>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await authClient.signIn.email(
        {
          email: value.email.trim(),
          password: value.password,
        },
        {
          onError(error) {
            //console.error(error.error?.message || "Failed to sign in");
            console.error("FULL ERROR:", JSON.stringify(error));
          },
          onSuccess() {
            formApi.reset();
            queryClient.refetchQueries();
            onSuccess?.();
          },
        }
      );
    },
  });

  return (
    <View>
      <Text className="mb-4 text-lg font-bold text-card-foreground">
        Sign In
      </Text>

      <form.Subscribe
        selector={(state) => ({
          isSubmitting: state.isSubmitting,
          validationError: getErrorMessage(state.errorMap.onSubmit),
        })}
      >
        {({ isSubmitting, validationError }) => (
          <View className="gap-4">
            {validationError && (
              <View className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3">
                <Text className="text-sm text-red-500">
                  {validationError}
                </Text>
              </View>
            )}

            <form.Field name="email">
              {(field) => (
                <View>
                  <Text className="mb-2 text-sm font-semibold text-card-foreground">
                    Email
                  </Text>

                  <TextInput
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    placeholder="email@example.com"
                    placeholderTextColor="#777780"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                  />
                </View>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <View>
                  <Text className="mb-2 text-sm font-semibold text-card-foreground">
                    Password
                  </Text>

                  <TextInput
                    ref={passwordInputRef}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    placeholder="••••••••"
                    placeholderTextColor="#777780"
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={form.handleSubmit}
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                  />
                </View>
              )}
            </form.Field>

            <Pressable
              onPress={form.handleSubmit}
              disabled={isSubmitting}
              className="mt-1 items-center rounded-3xl bg-brand p-4 active:opacity-80 disabled:opacity-50"
            >
              {isSubmitting ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-bold text-white">Sign In</Text>
              )}
            </Pressable>
          </View>
        )}
      </form.Subscribe>
    </View>
  );
}

export { SignIn };