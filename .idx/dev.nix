{ pkgs, ... }: {
  channel = "stable-23.11";

  packages = [
    # Core Development
    pkgs.nodejs_20
    pkgs.git
    pkgs.ripgrep
    pkgs.jq

    # Development Tools
    pkgs.curl
    pkgs.doas
    pkgs.sudo
  ];

  env = {
    # Editor & Terminal
    EDITOR = "code";
    TERM = "xterm-256color";
  };

  # IDX specific configurations
  idx = {
    extensions = [
      # Core IDE Features
      "editorconfig.editorconfig"
      "streetsidesoftware.code-spell-checker"

      # Development
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"

      # IDE Enhancements
      "usernamehw.errorlens"
      "christian-kohler.path-intellisense"
      "visualstudioexptteam.vscodeintellicode"
    ];

    workspace = {
      onCreate = {
        setup-check = ''
          echo "🔧 Setting up development environment..."
          git --version
          node --version
        '';
      };

      onStart = {
        environment-check = ''
          echo "🔍 Checking development environment..."
          echo "System Tools:"
          echo "============"
          git --version
          node --version
        '';
      };
    };
  };
}
