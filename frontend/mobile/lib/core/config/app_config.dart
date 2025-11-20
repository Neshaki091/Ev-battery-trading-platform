class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://api.evbtranding.site/api',
  );

  static const String websocketUrl = String.fromEnvironment(
    'WS_BASE_URL',
    defaultValue: 'http://api.evbtranding.site/api',
  );

  static const defaultPageSize = 20;
}
