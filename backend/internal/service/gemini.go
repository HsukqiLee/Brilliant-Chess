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

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

type GeminiService struct {
	apiKey string
}

func NewGeminiService(apiKey string) *GeminiService {
	return &GeminiService{apiKey: apiKey}
}

func (s *GeminiService) GenerateCommentary(req CommentaryRequest) (string, error) {
	if s.apiKey == "" {
		return "", fmt.Errorf("gemini api key not configured")
	}

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

	reqBytes, err := json.Marshal(geminiReqBody)
	if err != nil {
		return "", fmt.Errorf("failed to encode gemini request: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", s.apiKey)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(reqBytes))
	if err != nil {
		return "", fmt.Errorf("failed to call gemini api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("gemini api returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var geminiResp GeminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return "", fmt.Errorf("failed to decode gemini response: %w", err)
	}

	if len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
		return strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text), nil
	}

	return "AI Coach could not generate a review for this move.", nil
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

func (s *GeminiService) AnalyzeTactics(req TacticsRequest) (*TacticsResponse, error) {
	if s.apiKey == "" {
		return nil, fmt.Errorf("gemini api key not configured")
	}

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

	reqBytes, err := json.Marshal(geminiReqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to encode gemini request: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", s.apiKey)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(reqBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to call gemini api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gemini api returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var geminiResp GeminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, fmt.Errorf("failed to decode gemini response: %w", err)
	}

	if len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
		text := strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text)
		// Clean markdown wrapper if Gemini ignores instruction
		text = strings.TrimPrefix(text, "```json")
		text = strings.TrimPrefix(text, "```")
		text = strings.TrimSuffix(text, "```")
		text = strings.TrimSpace(text)

		var tacticsResp TacticsResponse
		if err := json.Unmarshal([]byte(text), &tacticsResp); err != nil {
			// Fallback: return raw text as explanation
			return &TacticsResponse{
				Theme:       "战术分析 (Tactics Analysis)",
				Explanation: text,
			}, nil
		}
		return &tacticsResp, nil
	}

	return nil, fmt.Errorf("ai coach could not generate tactics review")
}

