{
  description = "Yogi UI development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
    systems.url = "github:nix-systems/default";
  };

  outputs = { nixpkgs, systems, ... }:
    let
      eachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      devShells = eachSystem (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          dev = import ./.idx/dev.nix { inherit pkgs; };
        in
        {
          default = pkgs.mkShell {
            packages = dev.packages;
            shellHook = ''
              export PATH=$PWD/node_modules/.bin:$PATH
              ${builtins.concatStringsSep "\n" (builtins.map (var: "export ${var}=${builtins.getAttr var dev.env}") (builtins.attrNames dev.env))}
            '';
          };
        });
    };
}
