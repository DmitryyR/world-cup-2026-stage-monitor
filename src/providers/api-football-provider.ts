import { rawProviderPayloadSchema } from "@/domain/schemas";
import type { RawProviderPayload } from "@/domain/types";
import {
  apiFootballFixturesResponseSchema,
  type ApiFootballFixturesResponse,
} from "./api-football.schemas";
import { mapApiFootballResponseToRawProviderPayload } from "./api-football.mapper";
import type { TournamentDataProvider } from "./provider";

type ApiFootballProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  leagueId?: string;
  season?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export class ApiFootballProvider implements TournamentDataProvider {
  readonly name = "api-football";
  readonly source = "api-football";

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly leagueId: string;
  private readonly season: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: ApiFootballProviderConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.API_FOOTBALL_KEY ?? "";
    this.baseUrl =
      config.baseUrl ??
      process.env.API_FOOTBALL_BASE_URL ??
      "https://v3.football.api-sports.io";
    this.leagueId = config.leagueId ?? process.env.API_FOOTBALL_LEAGUE_ID ?? "1";
    this.season = config.season ?? process.env.API_FOOTBALL_SEASON ?? "2026";
    this.timeoutMs =
      config.timeoutMs ??
      Number.parseInt(process.env.API_REQUEST_TIMEOUT_MS ?? "10000", 10);
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async fetchTournamentData(): Promise<RawProviderPayload> {
    if (!this.apiKey) {
      throw new Error(
        "API_FOOTBALL_KEY is required when DATA_PROVIDER=api-football",
      );
    }

    const response = await this.fetchFixtures();
    const parsedResponse = apiFootballFixturesResponseSchema.parse(response);
    const payload = mapApiFootballResponseToRawProviderPayload(parsedResponse);

    return rawProviderPayloadSchema.parse(payload);
  }

  private async fetchFixtures(): Promise<ApiFootballFixturesResponse> {
    const url = new URL("/fixtures", ensureTrailingSlash(this.baseUrl));
    url.searchParams.set("league", this.leagueId);
    url.searchParams.set("season", this.season);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        headers: {
          "x-apisports-key": this.apiKey,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `API-Football request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as ApiFootballFixturesResponse;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `API-Football request timed out after ${this.timeoutMs}ms`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}
