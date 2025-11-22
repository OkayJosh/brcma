from typing import List
import numpy as np
from app.core.schemas import BrcmaInput, BrcmaResult, DesignOption

def _safe_norm(vec: np.ndarray) -> np.ndarray:
    vmax = vec.max() if vec.size else 0.0
    if vmax <= 0:
        return np.zeros_like(vec)
    return vec / vmax

def run_brcma(data: BrcmaInput) -> BrcmaResult:
    R, C = data.R, data.C
    S = np.array(data.S, dtype=float)  # n x m
    WRC = np.array(data.WRC, dtype=float)  # n
    WEC = np.array(data.WEC, dtype=float)  # m

    # Basic shape validation
    n, m = len(R), len(C)
    if S.shape != (n, m):
        raise ValueError(f"S must be {n}x{m}, got {S.shape}")
    if WRC.shape[0] != n:
        raise ValueError("WRC length must equal len(R)")
    if WEC.shape[0] != m:
        raise ValueError("WEC length must equal len(C)")

    # Clamp S to [0,1]
    S = np.clip(S, 0.0, 1.0)

    # RS and CC
    RS = S @ WEC            # shape (n,)
    CC = S.T @ WRC          # shape (m,)

    RS_norm = _safe_norm(RS)
    CC_norm = _safe_norm(CC)

    thr_sr = data.thr_sr
    thr_wr = data.thr_wr
    thr_mr = data.thr_mr

    SR = [i for i, v in enumerate(RS_norm.tolist()) if v >= thr_sr]
    WR = [i for i, v in enumerate(RS_norm.tolist()) if thr_wr <= v < thr_sr]
    RR = [i for i, v in enumerate(RS_norm.tolist()) if v < thr_wr]
    MR = [j for j, v in enumerate(CC_norm.tolist()) if v < thr_mr]

    # Heuristic design options
    do1 = DesignOption(
        name="Optimal",
        description="SR + medium WR addressing key criteria",
        requirements=SR + WR[: max(0, len(WR)//2)],
        criteria=[i for i in range(m) if i not in MR],
    )
    do2 = DesignOption(
        name="Balanced",
        description="Mix of SR and WR with trade-offs",
        requirements=SR + WR,
        criteria=list(range(m)),
    )
    do3 = DesignOption(
        name="Minimalist",
        description="Only SR to ensure simplicity",
        requirements=SR,
        criteria=[i for i in range(m) if i not in MR],
    )
    # Enhanced Quality suggests adding reqs to cover MR (represented by empty req indices for now)
    do4 = DesignOption(
        name="Enhanced Quality",
        description="Add new requirements to address MR",
        requirements=SR + WR,
        criteria=MR,
    )

    return BrcmaResult(
        RS=RS.tolist(),
        CC=CC.tolist(),
        RS_norm=RS_norm.tolist(),
        CC_norm=CC_norm.tolist(),
        SR=SR,
        WR=WR,
        RR=RR,
        MR=MR,
        design_options=[do1, do2, do3, do4],
    )
