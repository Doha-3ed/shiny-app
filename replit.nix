{ pkgs }: {
  deps = [
    pkgs.nodejs
    pkgs.python310
    pkgs.python310Packages.flask
    pkgs.python310Packages.fla
  ];
}
