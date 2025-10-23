# AI Integration Guide

## Overview

The Advanced Prompt Creator now supports optional AI enhancement through user‑provided API keys. This guide explains how to configure and use AI providers to refine your prompts.

## Supported AI Providers

- **OpenAI** (GPT‑4, GPT‑3.5‑turbo, GPT‑4o and mini variants)
- **Perplexity AI** (Sonar models)
- **GLM‑4.6** (Zhipu AI)

## Setup Instructions

### 1. Get an API Key

- **OpenAI:** <https://platform.openai.com/api-keys>
- **Perplexity:** <https://www.perplexity.ai/settings/api>
- **GLM‑4.6:** <https://open.bigmodel.cn/>

### 2. Configure in App

1. Click **⚙️ AI Settings** in the header.
2. Enable AI Enhancement.
3. Select your provider.
4. Enter your API key.
5. Choose a model.
6. Click **Test Connection**.
7. Click **Save Settings**.

### 3. Use AI Enhancement

1. Enter your prompt.
2. Check the **Enhance with AI** checkbox.
3. Click **Transform Prompt**.
4. View the AI‑enhanced output.

## Features

✅ Optional enhancement (opt‑in)

✅ Secure storage (keys stored locally only)

✅ Graceful fallback on errors

✅ Preserves all Success Criteria

✅ Comparison view support

✅ Works with file uploads

✅ Character limit enforcement

## FAQ

**Q: Is my API key secure?**  
A: Yes. Your API key is stored only in your browser’s localStorage and is never sent to our servers.

**Q: What happens if AI enhancement fails?**  
A: The app automatically falls back to rule‑based transformation, so you always get an output.

**Q: Does AI enhancement cost money?**  
A: Yes, you will be charged by your chosen AI provider based on your API usage.

**Q: Can I use AI enhancement without an API key?**  
A: No. You must provide your own API key from a supported provider.

## Troubleshooting

**Error: Invalid API Key**

- Verify your API key is correct.
- Check if the key has required permissions.
- Ensure the key is not expired.

**Error: Rate Limit Exceeded**

- Wait a few minutes and try again.
- Consider upgrading your API plan.

**Error: Timeout**

- Check your internet connection.
- Try again with a shorter input.

## Support

For issues or questions, please open an issue on GitHub.