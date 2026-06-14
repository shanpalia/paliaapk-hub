{ pkgs }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.gradle_7
    pkgs.jdk17
    pkgs.android-tools
    pkgs.nodePackages.typescript-language-server
  ];
}
