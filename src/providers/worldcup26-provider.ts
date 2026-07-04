import { rawProviderPayloadSchema } from "@/domain/schemas";
import type { RawProviderPayload } from "@/domain/types";
import {
  buildWorldCup26Diagnostics,
  formatWorldCup26Diagnostics,
  mapWorldCup26ResponseToRawProviderPayload,
} from "./worldcup26.mapper";
import {
  worldCup26ResponseSchema,
  type WorldCup26Response,
} from "./worldcup26.schemas";
import type { TournamentDataProvider } from "./provider";

type WorldCup26ProviderConfig = {
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export class WorldCup26Provider implements TournamentDataProvider {
  readonly name = "worldcup26";
  readonly source = "worldcup26";

  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: WorldCup26ProviderConfig = {}) {
    this.baseUrl =
      config.baseUrl ?? process.env.WORLDCUP26_BASE_URL ?? "https://worldcup26.ir";
    this.timeoutMs =
      config.timeoutMs ??
      Number.parseInt(process.env.API_REQUEST_TIMEOUT_MS ?? "10000", 10);
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async fetchTournamentData(): Promise<RawProviderPayload> {
    const response = await this.fetchGames();
    const parsedResponse = worldCup26ResponseSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw new Error(
        formatWorldCup26Diagnostics(
          {
            providerName: "worldcup26",
            rawGamesFetched: 0,
            normalizedMatchesCount: 0,
            countByStage: {},
            countByStatus: {},
            unknownStages: [],
            unknownStatuses: [],
          },
          "WorldCup26Provider returned invalid response shape",
        ),
      );
    }

    const payload = mapWorldCup26ResponseToRawProviderPayload(
      parsedResponse.data,
    );
    const parsedPayload = rawProviderPayloadSchema.parse(payload);

    return {
      ...parsedPayload,
      rawProviderPayload: {
        response: parsedResponse.data,
        diagnostics: buildWorldCup26Diagnostics(
          parsedResponse.data,
          parsedPayload.matches,
        ),
      },
    };
  }

  private async fetchGames(): Promise<WorldCup26Response> {
    const url = new URL("/get/games", ensureTrailingSlash(this.baseUrl));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `WorldCup26Provider request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as WorldCup26Response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `WorldCup26Provider request timed out after ${this.timeoutMs}ms`,
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
