import { BoundRequisites } from "./bound-requisites";
import { CounterpartyEvents } from "./counterparty-events";
import { CounterpartyBanner, CounterpartyHeader } from "./counterparty-header";
import { CounterpartyStats } from "./counterparty-stats";
import type { CounterpartyDetails } from "./types";

export function CounterpartyPage({
  counterparty,
}: {
  counterparty: CounterpartyDetails;
}) {
  return (
    <div className="flex flex-col">
      <CounterpartyHeader counterparty={counterparty} />
      <div className="mt-[30px]">
        <CounterpartyBanner counterparty={counterparty} />
      </div>
      <div className="mt-[30px] flex flex-col gap-[30px]">
        <CounterpartyStats id={counterparty.id} />
      </div>
      <div className="mt-5">
        <BoundRequisites counterparty={counterparty} />
      </div>
      <hr className="my-[30px] border-border/80" />
      <CounterpartyEvents id={counterparty.id} />
    </div>
  );
}
