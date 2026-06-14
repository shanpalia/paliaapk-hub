# Provisioning Android build tools: Gradle 7, JDK 17, and Android SDK tools.
# After this file is saved, please click the "Rebuild" prompt in the IDE.
{ pkgs }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.gradle_7
    pkgs.jdk17
    pkgs.android-tools
    pkgs.unzip
  ];
}
