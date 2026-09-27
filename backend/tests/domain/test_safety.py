"""The severity rule: anything at or above 2 in any category is unsafe."""

import pytest

from app.domain.safety import SEVERITY_THRESHOLD, HarmCategory, Redaction, SafetyVerdict


def test_threshold_is_2():
    assert SEVERITY_THRESHOLD == 2


def test_no_scores_is_safe():
    assert SafetyVerdict().is_safe


@pytest.mark.parametrize("category", list(HarmCategory))
@pytest.mark.parametrize(("severity", "safe"), [(0, True), (1, True), (2, False), (4, False), (6, False)])
def test_each_category_is_judged_by_the_threshold(category, severity, safe):
    verdict = SafetyVerdict({c: 0 for c in HarmCategory} | {category: severity})

    assert verdict.is_safe is safe
    assert verdict.flagged == ([] if safe else [category])


def test_flagged_lists_every_category_over_the_threshold():
    verdict = SafetyVerdict({HarmCategory.HATE: 2, HarmCategory.SEXUAL: 0, HarmCategory.VIOLENCE: 6})

    assert verdict.flagged == [HarmCategory.HATE, HarmCategory.VIOLENCE]


def test_redaction_reports_whether_pii_was_found():
    assert Redaction("x", ["email"]).found_pii
    assert not Redaction("x").found_pii
