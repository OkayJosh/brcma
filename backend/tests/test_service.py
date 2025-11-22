from app.core.schemas import BrcmaInput
from app.core.service import run_brcma

def test_basic_run():
    data = BrcmaInput(
        R=["r1","r2","r3"],
        C=["c1","c2","c3"],
        WRC=[1,1,1],
        WEC=[1,1,1],
        S=[
            [0.9,0.8,0.6],
            [0.2,0.4,0.3],
            [0.0,0.0,0.0],
        ],
    )
    out = run_brcma(data)
    assert len(out.RS) == 3
    assert len(out.CC) == 3
