{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.gradle_7
    pkgs.jdk17
    pkgs.android-tools
  ];

  env = {
    JAVA_HOME = "${pkgs.jdk17}";
  };

  idx = {
    extensions = [
      "usernamehw.errorlens"
      "esbenp.prettier-vscode"
    ];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
    };
  };
}
