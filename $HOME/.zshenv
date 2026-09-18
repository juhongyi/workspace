export PATH="$HOME/.opencode/bin:$PATH" # OpenCode
export PATH="$HOME/.local/bin:$PATH" # uv
export N_PREFIX="$HOME/n"
export PATH="$HOME/n/bin:$PATH"
export OPENCODE_ENABLE_EXA=1
export OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX=128000

# pnpm
export PNPM_HOME="$HOME/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME/bin:"*) ;;
  *) export PATH="$PNPM_HOME/bin:$PATH" ;;
esac
# pnpm end
