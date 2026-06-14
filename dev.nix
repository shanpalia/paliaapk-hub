{ pkgs }: {
  # Channel to search for packages
  channel = "stable-24.05";

  # List of packages to install in the environment
  packages = [
    pkgs.nodejs_20
    pkgs.gradle_7
    pkgs.jdk17
    pkgs.android-tools
  ];

  # Environment variables
  env = {
    JAVA_HOME = "${pkgs.jdk17}/lib/openjdk";
  };

  # IDE Extensions
  idx.extensions = [
    "ms-vscode.js-debug"
    "redhat.java"
    "vscjava.vscode-java-pack"
  ];
}
