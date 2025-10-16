export function cleanObject(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== null && v !== undefined && v !== '',
    ),
  );
}

export function sanitizeUser(user: any) {
  const { password, access_token, refresh_token, fcm_token, ...cleaned } = user;
  return cleaned;
}
