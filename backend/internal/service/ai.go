package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type CommentaryRequest struct {
	Fen        string `json:"fen"`
	Move       string `json:"move"`
	EvalBefore string `json:"evalBefore"`
	EvalAfter  string `json:"evalAfter"`
	BestMove   string `json:"bestMove"`
	Rating     string `json:"rating"`
}

type TacticsRequest struct {
	Fen        string `json:"fen"`
	PlayedMove string `json:"playedMove"`
	BestMove   string `json:"bestMove"`
}

type TacticsResponse struct {
	Theme       string `json:"theme"`
	Explanation string `json:"explanation"`
}

type OpenAIRequest struct {
	Model    string          `json:"model"`
	Messages []OpenAIMessage `json:"messages"`
}

type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

type AnthropicRequest struct {
	Model     string             `json:"model"`
	MaxTokens int                `json:"max_tokens"`
	Messages  []AnthropicMessage `json:"messages"`
}

type AnthropicMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AnthropicResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
}

type AIService struct {
	format   string
	apiKey   string
	endpoint string
	model    string
}

func NewAIService(format, apiKey, endpoint, model string) *AIService {
	return &AIService{
		format:   format,
		apiKey:   apiKey,
		endpoint: endpoint,
		model:    model,
	}
}

func (s *AIService) callAI(prompt string) (string, error) {
	if s.apiKey == "" {
		return "", fmt.Errorf("AI API key not configured")
	}

	var reqBody []byte
	var err error
	var url string
	headers := make(map[string]string)

	switch s.format {
	case "openai":
		if s.endpoint != "" {
			url = s.endpoint
		} else {
			url = "https://api.openai.com/v1/chat/completions"
		}
		headers["Authorization"] = "Bearer " + s.apiKey
		headers["Content-Type"] = "application/json"

		req := OpenAIRequest{
			Model: s.model,
			Messages: []OpenAIMessage{
				{Role: "user", Content: prompt},
			},
		}
		reqBody, err = json.Marshal(req)

	case "anthropic":
		if s.endpoint != "" {
			url = s.endpoint
		} else {
			url = "https://api.anthropic.com/v1/messages"
		}
		headers["x-api-key"] = s.apiKey
		headers["anthropic-version"] = "2023-06-01"
		headers["Content-Type"] = "application/json"

		req := AnthropicRequest{
			Model:     s.model,
			MaxTokens: 1024,
			Messages: []AnthropicMessage{
				{Role: "user", Content: prompt},
			},
		}
		reqBody, err = json.Marshal(req)

	case "gemini":
		if s.endpoint != "" {
			url = s.endpoint
		} else {
			url = fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", s.model, s.apiKey)
		}
		headers["Content-Type"] = "application/json"
		headers["x-goog-api-key"] = s.apiKey

		geminiReqBody := map[string]interface{}{
			"contents": []map[string]interface{}{
				{
					"parts": []map[string]interface{}{
						{
							"text": prompt,
						},
					},
				},
			},
		}
		reqBody, err = json.Marshal(geminiReqBody)

	default:
		return "", fmt.Errorf("unsupported AI format: %s", s.format)
	}

	if err != nil {
		return "", fmt.Errorf("failed to encode request payload: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", fmt.Errorf("failed to create http request: %w", err)
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call AI API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("AI API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	switch s.format {
	case "openai":
		var openAIResp OpenAIResponse
		if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
			return "", fmt.Errorf("failed to decode OpenAI response: %w", err)
		}
		if len(openAIResp.Choices) > 0 {
			return strings.TrimSpace(openAIResp.Choices[0].Message.Content), nil
		}
		return "", fmt.Errorf("openai API returned empty choices")

	case "anthropic":
		var anthropicResp AnthropicResponse
		if err := json.NewDecoder(resp.Body).Decode(&anthropicResp); err != nil {
			return "", fmt.Errorf("failed to decode Anthropic response: %w", err)
		}
		if len(anthropicResp.Content) > 0 {
			return strings.TrimSpace(anthropicResp.Content[0].Text), nil
		}
		return "", fmt.Errorf("anthropic API returned empty content")

	case "gemini":
		var geminiResp GeminiResponse
		if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
			return "", fmt.Errorf("failed to decode Gemini response: %w", err)
		}
		if len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
			return strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text), nil
		}
		return "", fmt.Errorf("gemini API returned empty content")
	}

	return "", fmt.Errorf("unexpected error parsing AI response")
}

func (s *AIService) GenerateCommentary(req CommentaryRequest) (string, error) {
	prompt := fmt.Sprintf(`你是一位国际象棋特级大师教练。
当前局面的 FEN 是: %s
玩家这手下的是: %s
此前 Stockfish 引擎评估分数是: %s
此后 Stockfish 引擎评估分数是: %s
Stockfish 推荐的最佳路线是: %s
这手棋被引擎评为: %s (例如: blunder失误, mistake错误, best最佳, book开局库等)

请为玩家生成一段简明扼要、具有启发性和教学价值的中文评语。
解释这手棋为什么被评为 %s。如果这手棋是失误，请结合评估分数和最佳推荐路线说明漏掉了什么战术或位置危机，或者说明为什么最佳走法更好；如果这手棋是好棋，请夸奖并指出其深层意图。
注意：保持评语简短（控制在3-4句话以内，约100字左右），语气要像专业的棋局分析教练。`,
		req.Fen, req.Move, req.EvalBefore, req.EvalAfter, req.BestMove, req.Rating, req.Rating)

	text, err := s.callAI(prompt)
	if err != nil {
		return "", err
	}
	if text == "" {
		return "AI Coach could not generate a review for this move.", nil
	}
	return text, nil
}

func (s *AIService) AnalyzeTactics(req TacticsRequest) (*TacticsResponse, error) {
	prompt := fmt.Sprintf(`你是一位国际象棋大师和战术分析专家。
当前的局面 FEN 是: %s
玩家在实战中走的是: %s
玩家漏掉的最佳走法是: %s

请识别出当前局面的战术主题（例如：牵制 (Pin)、双重攻击 (Fork)、底线闷杀 (Back Rank Mate)、闪击 (Discovered Attack)、消除防御 (Remove the Defender)、牵引 (Deflection)、过载 (Overloading)、发现攻击等，用中文表示，加上英文对照）。
并详细解释玩家的原走法为什么是失误，以及最佳走法是如何发挥战术优势的。

请严格以以下 JSON 格式响应：
{
  "theme": "战术名称 (英文对照)",
  "explanation": "简短的中文战术解释（100字以内，解释为什么最佳走法好，为什么原走法不好）"
}
请勿返回任何其他的文字或 Markdown 代码块标记（例如 json 代码块），直接返回 JSON 串。`,
		req.Fen, req.PlayedMove, req.BestMove)

	text, err := s.callAI(prompt)
	if err != nil {
		return nil, err
	}

	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	text = strings.TrimSpace(text)

	var tacticsResp TacticsResponse
	if err := json.Unmarshal([]byte(text), &tacticsResp); err != nil {
		return &TacticsResponse{
			Theme:       "战术分析 (Tactics Analysis)",
			Explanation: text,
		}, nil
	}
	return &tacticsResp, nil
}

func (s *AIService) PlayMove(fen string, legalMoves []string, personality string) (string, error) {
	prompt := fmt.Sprintf(`You are playing a game of chess as an AI opponent with the personality: "%s".
The current board state in FEN is: %s.
The list of legal moves available to you is: %v.
You must choose exactly one move from this list of legal moves.
Your response MUST be a JSON object containing:
1. "move": The move you choose (must be exactly one of the strings in the legal moves list).
2. "comment": A 1-sentence comment explaining your move, written in your personality style.

Return ONLY the raw JSON object, without markdown formatting.
Example: {"move": "e2e4", "comment": "I control the center and unleash my bishops!"}`, personality, fen, legalMoves)

	return s.callAI(prompt)
}
